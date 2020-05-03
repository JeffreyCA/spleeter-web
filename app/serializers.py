from rest_framework import serializers
from .models import *
from .validators import is_valid_youtube

class ChoicesSerializerField(serializers.SerializerMethodField):
    def to_representation(self, value):
        method_name = 'get_{field_name}_display'.format(field_name=self.field_name)
        method = getattr(value, method_name)
        return method()

class SeparatedSongSerializer(serializers.ModelSerializer):
    status = ChoicesSerializerField()
    overwrite = serializers.BooleanField(read_only=True)

    def validate(self, data):
        all_checked = data['vocals'] and data['drums'] and data['bass'] and data['other']
        none_checked = not (data['vocals'] or data['drums'] or data['bass'] or data['other'])
        if all_checked:
            raise serializers.ValidationError({'checked': 'You must leave at least one part unchecked.'})
        if none_checked:
            raise serializers.ValidationError({'checked': 'You must check at least one part.'})
        return data

    class Meta:
        model = SeparatedSong
        fields = ('id', 'source_song', 'artist', 'title', 'vocals', 'drums', 'bass', 'other', 'status', 'url', 'error', 'overwrite', 'date_created')

class SourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceFile
        fields = ('id', 'file', 'is_youtube', 'youtube_link', 'youtube_fetch_task')

class YouTubeLinkSerializer(serializers.Serializer):
    link = serializers.URLField(validators=[is_valid_youtube])

class FetchTaskSerializer(serializers.ModelSerializer):
    status = ChoicesSerializerField()
    class Meta:
        model = YouTubeFetchTask
        fields = ('id', 'status')

class SourceSongSerializer(serializers.ModelSerializer):
    separated = SeparatedSongSerializer(many=True, read_only=True)

    class Meta:
        model = SourceSong
        fields = ('id', 'source_id', 'url', 'artist', 'title', 'separated', 'date_created')

class SourceSongYouTubeSerializer(serializers.ModelSerializer):
    youtube_link = serializers.URLField(write_only=True)
    artist = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=100)

    def create(self, validated_data):
        validated_data.pop('youtube_link', None)
        return super().create(validated_data)

    class Meta:
        model = SourceSong
        fields = ['id', 'youtube_link', 'artist', 'title']
