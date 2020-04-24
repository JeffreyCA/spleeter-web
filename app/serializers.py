from rest_framework import serializers
from .models import Song, SourceFile

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ('id', 'source_id', 'source_url', 'artist', 'title')

class SourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceFile
        fields = ('id', 'file')
