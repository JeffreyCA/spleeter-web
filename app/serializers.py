from rest_framework import serializers
from .models import Song, TempFile

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ('id', 'file', 'artist', 'title')

class TempFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempFile
        fields = ('id', 'file')
