from io import BytesIO
import os
import requests
import sys
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3NoHeaderError

from .validators import *
from .youtubedl import get_meta_info

def source_file_path(instance, filename):
    return os.path.join(settings.UPLOAD_DIR, str(instance.id), filename)

class YouTubeFetchTask(models.Model):
    class Status(models.IntegerChoices):
        QUEUED = 0
        IN_PROGRESS = 1
        DONE = 2
        ERROR = -1
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.IntegerField(choices=Status.choices, default=Status.QUEUED)
    error = models.TextField(blank=True)

class SourceFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=source_file_path, blank=True, null=True, max_length=255, validators=[is_valid_size, is_mp3])
    is_youtube = models.BooleanField(default=False)
    youtube_link = models.URLField(unique=True, blank=True, null=True, validators=[is_valid_youtube])
    youtube_fetch_task = models.OneToOneField(YouTubeFetchTask, on_delete=models.SET_NULL, null=True, blank=True)

    # Extract artist and title information from MP3 or YouTube video
    def metadata(self):
        artist = ''
        title = ''
        if self.youtube_link:
            info = get_meta_info(self.youtube_link)
            if info['embedded_artist'] and info['embedded_title']:
                artist = info['embedded_artist']
                title = info['embedded_title']
            elif info['parsed_artist'] and info['parsed_title']:
                artist = info['parsed_artist']
                title = info['parsed_title']
            else:
                artist = info['uploader']
                title = info['title']
        else:
            try:
                if settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage':
                    audio = EasyID3(self.file.path)
                else:
                    r = requests.get(self.file.url)
                    file = BytesIO(r.content)
                    audio = EasyID3(file)

                if 'artist' in audio:
                    artist = audio['artist'][0]
                if 'title' in audio:
                    title = audio['title'][0]
            except ID3NoHeaderError:
                pass
        return (artist, title)

    def __str__(self):
        if self.file and self.file.name:
            return os.path.basename(self.file.name)
        elif self.youtube_link:
            return self.youtube_link
        else:
            return self.id

class SourceSong(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_id = models.OneToOneField(SourceFile, on_delete=models.PROTECT, unique=True)
    artist = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    date_created = models.DateTimeField(auto_now_add=True)

    def source_url(self):
        return self.source_id.file.url
    
    def url(self):
        if self.source_id.file:
            return self.source_id.file.url
        return ''

    def youtube_link(self):
        return self.source_id.youtube_link
    
    def youtube_fetch_task(self):
        return self.source_id.youtube_fetch_task.id

    def __str__(self):
        return self.artist + ' - ' + self.title

class SeparatedSong(models.Model):
    class Status(models.IntegerChoices):
        QUEUED = 0
        IN_PROGRESS = 1
        DONE = 2
        ERROR = -1

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_song = models.ForeignKey(SourceSong, related_name='separated', on_delete=models.CASCADE)
    vocals = models.BooleanField()
    drums = models.BooleanField()
    bass = models.BooleanField()
    other = models.BooleanField()
    status = models.IntegerField(choices=Status.choices, default=Status.QUEUED)
    file = models.FileField(upload_to=settings.SEPARATE_DIR, max_length=255, blank=True)
    error = models.TextField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

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

    def source_url(self):
        return self.source_song.source_id.file.url

    class Meta:
        unique_together = [['source_song', 'vocals', 'drums', 'bass', 'other']]
