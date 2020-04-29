import os
import sys
import uuid

from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .validators import *
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from mutagen.easyid3 import EasyID3

# Create your models here.
class SourceFile(models.Model):
    file = models.FileField(upload_to='uploads/', validators=[is_valid_size, is_mp3])

    # Extract artist and title information from MP3
    def metadata(self):
        audio = EasyID3(self.file.path)
        artist = ''
        title = ''
        if 'artist' in audio:
            artist = audio['artist'][0]
        if 'title' in audio:
            title = audio['title'][0]
        return (artist, title)

    def __str__(self):
        return os.path.basename(self.file.name)

class SourceSong(models.Model):
    source_id = models.OneToOneField(SourceFile, on_delete=models.PROTECT, unique=True)
    artist = models.CharField(max_length=100)
    title = models.CharField(max_length=100)

    def source_path(self):
        return self.source_id.file.path

    def source_url(self):
        return self.source_id.file.url
    
    def url(self):
        return self.source_id.file.url

    def __str__(self):
        return self.artist + ' - ' + self.title

class SeparateTaskResult(models.Model):
    class Status(models.IntegerChoices):
        CREATED = 1
        IN_PROGRESS = 2
        DONE = 3
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_song = models.ForeignKey(SourceSong, on_delete=models.CASCADE)
    vocals = models.BooleanField()
    drums = models.BooleanField()
    bass = models.BooleanField()
    other = models.BooleanField()

class SeparatedSong(models.Model):
    class Status(models.IntegerChoices):
        CREATED = 0
        IN_PROGRESS = 1
        DONE = 2
        ERROR = -1

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_song = models.ForeignKey(SourceSong, related_name='separated', on_delete=models.CASCADE)
    vocals = models.BooleanField()
    drums = models.BooleanField()
    bass = models.BooleanField()
    other = models.BooleanField()
    status = models.IntegerField(choices=Status.choices, default=Status.CREATED)
    file = models.FileField(upload_to='separate/', blank=True)
    error = models.TextField(blank=True)

    def artist(self):
        return self.source_song.artist

    def title(self):
        return self.source_song.title

    def url(self):
        if self.file:
            return self.file.url
        return ''

    def formatted_name(self):
        prefix_lst = [self.source_song.artist, ' - ', self.source_song.title]
        parts_lst = []
        if self.vocals:
            parts_lst.append('vocals')
        if self.drums:
            parts_lst.append('drums')
        if self.bass:
            parts_lst.append('bass')
        if self.other:
            parts_lst.append('other')
        prefix = ''.join(prefix_lst)
        parts = ', '.join(parts_lst)
        formatted = prefix + ' (' + parts + ')'
        return formatted

    def source_path(self):
        return self.source_song.source_id.file.path

    class Meta:
        unique_together = [['source_song', 'vocals', 'drums', 'bass', 'other']]

@receiver(pre_delete, sender=SourceFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    # Delete file on disk before deleting instance
    instance.file.delete()
