from rest_framework import serializers
from .models import *
from .validators import is_valid_youtube

"""
This module defines Django serializers.
"""

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

class DynamicMixSerializer(serializers.ModelSerializer):
    """Serializer for DynamicMix model."""
    # The status of the source separation task
    status = ChoicesSerializerField()
    # Whether to overwrite any existing dynamic mix with the same source track
    overwrite = serializers.BooleanField(read_only=True)

    class Meta:
        model = DynamicMix
        fields = ('id', 'celery_id', 'source_track', 'artist', 'title', 'vocals_file',
                  'other_file', 'bass_file', 'drums_file', 'status', 'error',
                  'overwrite', 'date_created')

class StaticMixSerializer(serializers.ModelSerializer):
    """Serializer for StaticMix model."""
    # The status of the source separation task
    status = ChoicesSerializerField()
    # Whether to overwrite any existing static mix with the same source track and 'parts to keep'.
    overwrite = serializers.BooleanField(read_only=True)

    def validate(self, data):
        """
        Validate request data to ensure that the user does not separate a source track
        with zero or all four parts checked.

        :param data: Request data
        """
        all_checked = data['vocals'] and data['drums'] and data[
            'bass'] and data['other']
        none_checked = not (data['vocals'] or data['drums'] or data['bass']
                            or data['other'])
        if all_checked:
            raise serializers.ValidationError(
                {'checked': 'You must leave at least one part unchecked.'})
        if none_checked:
            raise serializers.ValidationError(
                {'checked': 'You must check at least one part.'})
        return data

    class Meta:
        model = StaticMix
        fields = ('id', 'source_track', 'artist', 'title', 'vocals', 'drums',
                  'bass', 'other', 'status', 'url', 'error', 'overwrite',
                  'date_created')

class SourceFileSerializer(serializers.ModelSerializer):
    """Serializer for SourceFile model"""
    youtube_fetch_task = YTAudioDownloadTaskSerializer(many=False, read_only=True)
    class Meta:
        model = SourceFile
        fields = ('id', 'file', 'is_youtube', 'youtube_link',
                  'youtube_fetch_task')

class SourceTrackSerializer(serializers.ModelSerializer):
    """Serializer for representing a SourceTrack along with its associated StaticMixes."""
    static = StaticMixSerializer(many=True, read_only=True)
    dynamic = DynamicMixSerializer(many=False, read_only=True)
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

    class Meta:
        model = SourceTrack
        fields = ('id', 'source_file', 'url', 'artist', 'title', 'static',
                  'dynamic', 'is_youtube', 'youtube_link', 'fetch_task',
                  'fetch_task_status', 'fetch_task_error', 'date_created')
