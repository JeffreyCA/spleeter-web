from rest_framework import serializers
from .models import *

class SourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceFile
        fields = ('id', 'file')

class SourceSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceSong
        fields = ('id', 'source_id', 'source_url', 'artist', 'title')

class SeparatedSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeparatedSong
        fields = ('id', 'source_song', 'vocals', 'drums', 'bass', 'other')

    def validate(self, data):
        all_checked = data['vocals'] and data['drums'] and data['bass'] and data['other']
        none_checked = not (data['vocals'] or data['drums'] or data['bass'] or data['other'])
        if all_checked:
            raise serializers.ValidationError("Must leave one part out.")
        elif none_checked:
            raise serializers.ValidationError("Must select at least one part.")
        return data
