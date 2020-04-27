from rest_framework import serializers
from .models import *

class ChoicesSerializerField(serializers.SerializerMethodField):
    def to_representation(self, value):
        method_name = 'get_{field_name}_display'.format(field_name=self.field_name)
        method = getattr(value, method_name)
        return method()

class SeparatedSongSerializer(serializers.ModelSerializer):
    status = ChoicesSerializerField()
    overwrite = serializers.BooleanField(read_only=True)

    class Meta:
        model = SeparatedSong
        fields = ('id', 'source_song', 'vocals', 'drums', 'bass', 'other', 'status', 'file', 'error', 'overwrite')

    def validate(self, data):
        all_checked = data['vocals'] and data['drums'] and data['bass'] and data['other']
        none_checked = not (data['vocals'] or data['drums'] or data['bass'] or data['other'])
        if all_checked:
            raise serializers.ValidationError({'checked': 'You must leave at least one part unchecked.'})
        if none_checked:
            raise serializers.ValidationError({'checked': 'You must check at least one part.'})
        return data

class SourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceFile
        fields = ('id', 'file')

class SourceSongSerializer(serializers.ModelSerializer):
    separated = SeparatedSongSerializer(many=True, read_only=True)
    class Meta:
        model = SourceSong
        fields = ('id', 'source_id', 'source_url', 'artist', 'title', 'separated')
