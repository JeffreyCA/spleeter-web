import os
import sys

from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .validators import *

from mutagen.easyid3 import EasyID3

# Create your models here.
class SourceFile(models.Model):
    file = models.FileField(upload_to='tmp/', validators=[is_valid_size, is_mp3])

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

@receiver(pre_delete, sender=SourceFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    # Delete file on disk before deleting instance
    instance.file.delete()

class Song(models.Model):
    file = models.OneToOneField(SourceFile, on_delete=models.PROTECT)
    artist = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    def __str__(self):
        return self.artist + ' - ' + self.title
