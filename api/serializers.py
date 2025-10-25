from rest_framework import serializers
from .models import *
from .validators import is_valid_youtube
"""
This module defines Django serializers.
"""

LEGACY_SEPARATORS = {D3NET, XUMX}

class PickledObjectSerializerField(serializers.Field):
    """Serializer field for PickledObjectField"""
    def to_internal_value(self, data):
        return data

    def to_representation(self, obj):
        return obj

class ChoicesSerializerField(serializers.SerializerMethodField):
    """Read-only field with representation of a model field with choices."""
    def to_representation(self, value):
        method_name = 'get_{field_name}_display'.format(
            field_name=self.field_name)
        method = getattr(value, method_name)
        return method()

class YTLinkSerializer(serializers.Serializer):
    """Simple serializer for a valid YouTube video URL."""
    link = serializers.URLField(validators=[is_valid_youtube])

class YTSearchQuerySerializer(serializers.Serializer):
    """Simple serializer for a YouTube search query."""
    query = serializers.CharField()
    page_token = serializers.CharField(allow_blank=True, required=False)

class YTAudioDownloadTaskSerializer(serializers.ModelSerializer):
    """Serializer for YTAudioDownloadTask model"""
    status = ChoicesSerializerField()

    class Meta:
        model = YTAudioDownloadTask
        fields = ('id', 'celery_id', 'status', 'error')

class SourceFileSerializer(serializers.ModelSerializer):
    """Serializer for SourceFile model"""
    youtube_fetch_task = YTAudioDownloadTaskSerializer(many=False,
                                                       read_only=True)

    class Meta:
        model = SourceFile
        fields = ('id', 'file', 'is_youtube', 'youtube_link',
                  'youtube_fetch_task')

class LiteDynamicMixSerializer(serializers.ModelSerializer):
    """Serializer for DynamicMix model with minimal information."""
    # The status of the source separation task
    status = ChoicesSerializerField()
    # Extra information about mix
    extra_info = serializers.ListField(child=serializers.CharField(),
                                       source='get_extra_info',
                                       read_only=True)

    class Meta:
        model = DynamicMix
        fields = ('id', 'source_track', 'separator', 'bitrate', 'extra_info',
                  'artist', 'title', 'vocals_url', 'other_url', 'piano_url',
                  'bass_url', 'drums_url', 'status', 'error', 'date_created',
                  'date_finished')

class LiteStaticMixSerializer(serializers.ModelSerializer):
    """Serializer for StaticMix model with minimal information."""
    # The status of the source separation task
    status = ChoicesSerializerField()
    # Extra information about mix
    extra_info = serializers.ListField(child=serializers.CharField(),
                                       source='get_extra_info',
                                       read_only=True)

    class Meta:
        model = StaticMix
        fields = ('id', 'source_track', 'separator', 'extra_info', 'artist',
                  'title', 'vocals', 'drums', 'bass', 'other', 'piano', 'status', 'url',
                  'error', 'date_created', 'date_finished')

class FullDynamicMixSerializer(serializers.ModelSerializer):
    """Serializer for DynamicMix model."""
    separator_args = PickledObjectSerializerField()
    # The status of the source separation task
    status = ChoicesSerializerField()

    def validate(self, data):
        """
        Validate request data to ensure all separator args are included.

        :param data: Request data
        """
        if data['separator'] in LEGACY_SEPARATORS:
            raise serializers.ValidationError({
                'separator':
                'D3Net and X-UMX are no longer available for new mixes.'
            })

        args = data['separator_args']
        if data['separator'] in DEMUCS_FAMILY:
            try:
                random_shifts = args['random_shifts']
                if random_shifts < 0:
                    raise serializers.ValidationError(
                        {'args': 'Random shifts must be greater than 0.'})
            except KeyError:
                raise serializers.ValidationError(
                    {'args': "Must include 'random_shifts' argument."})

        return data

    class Meta:
        model = DynamicMix
        fields = ('id', 'celery_id', 'source_track', 'separator',
                  'separator_args', 'bitrate', 'artist', 'title',
                  'vocals_url', 'other_url', 'piano_url', 'bass_url', 'drums_url', 'status',
                  'error', 'date_created', 'date_finished')

class FullStaticMixSerializer(serializers.ModelSerializer):
    """Serializer for StaticMix model."""
    separator_args = PickledObjectSerializerField()
    # The status of the source separation task
    status = ChoicesSerializerField()

    def validate(self, data):
        """
        Validate request data to ensure that the user does not separate a source track
        with zero or all four parts checked. Also validate separator args.

        :param data: Request data
        """
        all_checked = data['vocals'] and data['drums'] and data[
            'bass'] and data['other']
        none_checked = not (data['vocals'] or data['drums'] or data['bass']
                            or data['other'])

        if data['separator'] == SPLEETER_PIANO:
            all_checked = all_checked and data['piano']
            none_checked = none_checked and not data['piano']

        if all_checked:
            raise serializers.ValidationError(
                {'checked': 'You must leave at least one part unchecked.'})
        if none_checked:
            raise serializers.ValidationError(
                {'checked': 'You must check at least one part.'})

        args = data['separator_args']
        if data['separator'] in LEGACY_SEPARATORS:
            raise serializers.ValidationError({
                'separator':
                'D3Net and X-UMX are no longer available for new mixes.'
            })

        if data['separator'] in DEMUCS_FAMILY:
            try:
                random_shifts = args['random_shifts']
                if random_shifts < 0:
                    raise serializers.ValidationError(
                        {'args': 'Random shifts must be greater than 0.'})
            except KeyError:
                raise serializers.ValidationError(
                    {'args': "Must include 'random_shifts' argument."})

        return data

    class Meta:
        model = StaticMix
        fields = ('id', 'celery_id', 'source_track', 'separator',
                  'separator_args', 'bitrate', 'artist', 'title',
                  'vocals', 'drums', 'bass', 'other', 'piano', 'status', 'url', 'error',
                  'date_created', 'date_finished')

class LiteSourceTrackSerializer(serializers.ModelSerializer):
    """Serializer for representing a SourceTrack along with its associated mixes. Minimal information."""
    static = LiteStaticMixSerializer(many=True, read_only=True)
    dynamic = LiteDynamicMixSerializer(many=True, read_only=True)
    fetch_task_status = serializers.CharField(
        source='source_file.youtube_fetch_task.get_status_display',
        read_only=True,
        default=None)
    fetch_task_error = serializers.CharField(
        source='source_file.youtube_fetch_task.error',
        read_only=True,
        default=None)
    fetch_task_date_finished = serializers.DateTimeField(
        source='source_file.youtube_fetch_task.date_finished',
        read_only=True,
        default=None)

    class Meta:
        model = SourceTrack
        fields = ('id', 'url', 'artist', 'title', 'static', 'dynamic',
                  'fetch_task_status', 'fetch_task_error', 'date_created',
                  'fetch_task_date_finished')

class FullSourceTrackSerializer(serializers.ModelSerializer):
    """Serializer for representing a SourceTrack along with its associated mixes."""
    static = FullStaticMixSerializer(many=True, read_only=True)
    dynamic = FullDynamicMixSerializer(many=True, read_only=True)
    is_youtube = serializers.BooleanField(source='source_file.is_youtube',
                                          read_only=True)
    youtube_link = serializers.CharField(source='source_file.youtube_link',
                                         read_only=True)
    fetch_task = serializers.CharField(
        source='source_file.youtube_fetch_task.id', read_only=True)
    fetch_task_status = serializers.CharField(
        source='source_file.youtube_fetch_task.get_status_display',
        read_only=True,
        default=None)
    fetch_task_error = serializers.CharField(
        source='source_file.youtube_fetch_task.error',
        read_only=True,
        default=None)
    fetch_task_date_finished = serializers.DateTimeField(
        source='source_file.youtube_fetch_task.date_finished',
        read_only=True,
        default=None)

    class Meta:
        model = SourceTrack
        fields = ('id', 'source_file', 'url', 'artist', 'title', 'static',
                  'dynamic', 'is_youtube', 'youtube_link', 'fetch_task',
                  'fetch_task_status', 'fetch_task_error', 'date_created',
                  'fetch_task_date_finished')

class YTSourceTrackSerializer(serializers.ModelSerializer):
    """Serializer for a SourceTrack derived from YouTube link."""
    youtube_link = serializers.URLField(write_only=True)
    artist = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=100)

    def create(self, validated_data):
        validated_data.pop('youtube_link', None)
        return super().create(validated_data)

    class Meta:
        model = SourceTrack
        fields = ['id', 'youtube_link', 'artist', 'title']
