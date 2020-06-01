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
    """
    Get path to source file, using instance ID as subdirectory.

    :param instance: SourceFile instance
    :param filename: File name
    :return: Path to source file
    """
    return os.path.join(settings.UPLOAD_DIR, str(instance.id), filename)

def processed_track_path(instance, filename):
    """
    Get path to processed track file, using instance ID as subdirectory.

    :param instance: ProcessedTrack instance
    :param filename: File name
    :return: Path to processed track file
    """
    return os.path.join(settings.SEPARATE_DIR, str(instance.id), filename)

class YTAudioDownloadTask(models.Model):
    """Model representing the status of a task to fetch audio from YouTube link."""
    class Status(models.IntegerChoices):
        """Enum for status types."""
        QUEUED = 0
        IN_PROGRESS = 1
        DONE = 2
        ERROR = -1

    # UUID to uniquely identify task
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Status of task
    status = models.IntegerField(choices=Status.choices, default=Status.QUEUED)
    # Error message in case of error
    error = models.TextField(blank=True)

class SourceFile(models.Model):
    """
    Model representing the file of a source/original audio track.

    If a user uploads the audio file but than aborts the operation, then the SourceFile and the file
    on disk is deleted.
    """
    # UUID to uniquely identify file
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # File object
    file = models.FileField(upload_to=source_file_path, blank=True, null=True, max_length=255, validators=[is_valid_size, is_valid_audio_file])
    # Whether the audio track is from a YouTube link import
    is_youtube = models.BooleanField(default=False)
    # The original YouTube link, if source is from YouTube
    youtube_link = models.URLField(unique=True, blank=True, null=True, validators=[is_valid_youtube])
    # If file is from a YouTube link import, then this field refers to the task executed to download the audio file.
    youtube_fetch_task = models.OneToOneField(YTAudioDownloadTask, on_delete=models.DO_NOTHING, null=True, blank=True)

    def metadata(self):
        """Extract artist and title information from audio

        :return: Dict containing 'artist' and 'title' fields associated with the track
        """
        artist = ''
        title = ''
        if self.youtube_link:
            try:
                info = get_meta_info(self.youtube_link)
            except:
                print('Getting metadata failed')
                info = None
            if not info:
                artist = ''
                title = ''
            elif info['embedded_artist'] and info['embedded_title']:
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

class SourceTrack(models.Model):
    """
    Model representing the source song itself. SourceTrack differs from SourceFile as SourceTrack
    contains additional metadata such as artist, title, and date created info.

    SourceTrack contains a reference to SourceFile. The reasoning why they're separate is because the
    user first uploads an audio file to the server, then confirms the artist and title information,
    then completes the process of adding a new audio track.

    If a user uploads the audio file but than aborts the operation, then the SourceFile and the file
    on disk is deleted.

    TODO: Refactor SourceFile and SourceTrack in a cleaner way.
    """
    # UUID to uniquely identify the source song
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Corresponding SourceFile (id)
    source_file = models.OneToOneField(SourceFile, on_delete=models.DO_NOTHING, unique=True)
    # Artist name
    artist = models.CharField(max_length=200)
    # Title
    title = models.CharField(max_length=200)
    # DateTime when user added the song
    date_created = models.DateTimeField(auto_now_add=True)
    
    def url(self):
        """Get the URL of the source file."""
        if self.source_file.file:
            return self.source_file.file.url
        return ''

    def youtube_link(self):
        """Get the YouTube link of the source file (may return None)."""
        return self.source_file.youtube_link

    def youtube_fetch_task(self):
        """Get the ID of the YouTube fetch task associated with the track."""
        return self.source_file.youtube_fetch_task.id

    def __str__(self):
        """String representation."""
        return self.artist + ' - ' + self.title

class ProcessedTrack(models.Model):
    """Model representing a track that has undergone source separation (using Spleeter)."""
    class Status(models.IntegerChoices):
        """
        Enum for status of source separation task.
        FIXME: Make a dedicated source separation task model.
        """
        QUEUED = 0
        IN_PROGRESS = 1
        DONE = 2
        ERROR = -1

    # UUID to uniquely identify track
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Source track on which it is based
    source_track = models.ForeignKey(SourceTrack, related_name='processed', on_delete=models.CASCADE)
    # Whether track contains vocals
    vocals = models.BooleanField()
    # Whether track contains drums
    drums = models.BooleanField()
    # Whether track contains bass
    bass = models.BooleanField()
    # Whether track contains accompaniment ('other' is the term used by Spleeter API)
    other = models.BooleanField()
    # Status of source separation task
    status = models.IntegerField(choices=Status.choices, default=Status.QUEUED)
    # Underlying file
    file = models.FileField(upload_to=processed_track_path, max_length=255, blank=True)
    # Error message
    error = models.TextField(blank=True)
    # DateTime when source separation task was started
    date_created = models.DateTimeField(auto_now_add=True)

    def artist(self):
        """Get the artist name."""
        return self.source_track.artist

    def title(self):
        """Get the title."""
        return self.source_track.title

    def url(self):
        """Get the file URL"""
        if self.file:
            return self.file.url
        return ''

    def formatted_name(self):
        """
        Produce a string with the format like:
        "Artist - Title (vocals, drums, bass, other)"
        """
        prefix_lst = [self.source_track.artist, ' - ', self.source_track.title]
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
        """
        
        """
        return self.source_track.source_file.file.path

    def source_url(self):
        """

        """
        return self.source_track.source_file.file.url

    class Meta:
        unique_together = [['source_track', 'vocals', 'drums', 'bass', 'other']]
