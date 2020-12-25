import os
import uuid
from io import BytesIO

import requests
from django.conf import settings
from django.core.validators import MaxValueValidator
from django.db import models
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3NoHeaderError

from .validators import *
from .youtubedl import get_meta_info

"""
This module defines Django models.
"""

def source_file_path(instance, filename):
    """
    Get path to source file, using instance ID as subdirectory.

    :param instance: SourceFile instance
    :param filename: File name
    :return: Path to source file
    """
    return os.path.join(settings.UPLOAD_DIR, str(instance.id), filename)

def mix_track_path(instance, filename):
    """
    Get path to mix track file, using instance ID as subdirectory.

    :param instance: StaticMix/DynamicMix instance
    :param filename: File name
    :return: Path to mix track file
    """
    return os.path.join(settings.SEPARATE_DIR, str(instance.id), filename)

SPLEETER = 'spleeter'
DEMUCS = 'demucs'
DEMUCS_EXTRA = 'demucs_extra'
DEMUCS_LIGHT = 'light'
DEMUCS_LIGHT_EXTRA = 'light_extra'
TASNET = 'tasnet'
TASNET_EXTRA = 'tasnet_extra'

SEP_CHOICES = [
    (SPLEETER, 'Spleeter'),
    ('demucs', (
        (DEMUCS, 'Demucs'),
        (DEMUCS_EXTRA, 'Demucs (extra)'),
        (DEMUCS_LIGHT, 'Demucs Light'),
        (DEMUCS_LIGHT_EXTRA, 'Demucs Light (extra)'),
        (TASNET, 'Tasnet'),
        (TASNET_EXTRA, 'Tasnet (extra)'),
    )),
]

class TaskStatus(models.IntegerChoices):
    """
    Enum for status of a task.
    """
    QUEUED = 0, 'Queued'
    IN_PROGRESS = 1, 'In Progress'
    DONE = 2, 'Done'
    ERROR = -1, 'Error'

class YTAudioDownloadTask(models.Model):
    """Model representing the status of a task to fetch audio from YouTube link."""
    # UUID to uniquely identify task
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ID of the associated Celery task
    celery_id = models.UUIDField(default=None, null=True, blank=True)
    # Status of task
    status = models.IntegerField(choices=TaskStatus.choices,
                                 default=TaskStatus.QUEUED)
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
    file = models.FileField(upload_to=source_file_path,
                            blank=True,
                            null=True,
                            max_length=255,
                            validators=[is_valid_size, is_valid_audio_file])
    # Whether the audio track is from a YouTube link import
    is_youtube = models.BooleanField(default=False)
    # The original YouTube link, if source is from YouTube
    youtube_link = models.URLField(unique=True,
                                   blank=True,
                                   null=True,
                                   validators=[is_valid_youtube])
    # If file is from a YouTube link import, then this field refers to the task executed to download the audio file.
    youtube_fetch_task = models.OneToOneField(YTAudioDownloadTask,
                                              on_delete=models.DO_NOTHING,
                                              null=True,
                                              blank=True)

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
                if settings.DEFAULT_FILE_STORAGE == 'api.storage.FileSystemStorage':
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
    source_file = models.OneToOneField(SourceFile,
                                       on_delete=models.DO_NOTHING,
                                       unique=True)
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

class StaticMix(models.Model):
    """Model representing a statically mixed track (certain parts are excluded)."""
    # UUID to uniquely identify track
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ID of the associated Celery task
    celery_id = models.UUIDField(default=None, null=True, blank=True)
    # Separation model
    separator = models.CharField(max_length=20,
                                 choices=SEP_CHOICES,
                                 default=SPLEETER)
    # Random shift value (for Demucs)
    random_shifts = models.PositiveSmallIntegerField(
        default=0, validators=[MaxValueValidator(10)])
    # Source track on which it is based
    source_track = models.ForeignKey(SourceTrack,
                                     related_name='static',
                                     on_delete=models.CASCADE)
    # Whether track contains vocals
    vocals = models.BooleanField()
    # Whether track contains drums
    drums = models.BooleanField()
    # Whether track contains bass
    bass = models.BooleanField()
    # Whether track contains accompaniment ('other' is the term used by Spleeter API)
    other = models.BooleanField()
    # Status of source separation task
    status = models.IntegerField(choices=TaskStatus.choices,
                                 default=TaskStatus.QUEUED)
    # Underlying file
    file = models.FileField(upload_to=mix_track_path,
                            max_length=255,
                            blank=True)
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
        return f'{prefix} ({parts}) [{self.separator}, {self.random_shifts}]'

    def source_path(self):
        """Get the path to the source file."""
        return self.source_track.source_file.file.path

    def source_url(self):
        """Get the URL of the source file."""
        return self.source_track.source_file.file.url

    class Meta:
        unique_together = [[
            'source_track', 'separator', 'random_shifts', 'vocals', 'drums', 'bass', 'other'
        ]]

class DynamicMix(models.Model):
    """Model representing a track that has been split into individually components."""
    # UUID to uniquely identify track
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ID of the associated Celery task
    celery_id = models.UUIDField(default=None, null=True, blank=True)
    # Separation model
    separator = models.CharField(max_length=20,
                                 choices=SEP_CHOICES,
                                 default=SPLEETER)
    # Random shift value (for Demucs)
    random_shifts = models.PositiveSmallIntegerField(
        default=0, validators=[MaxValueValidator(10)])
    # Source track on which it is based
    source_track = models.OneToOneField(SourceTrack,
                                        related_name='dynamic',
                                        on_delete=models.CASCADE)
    # Path to vocals file
    vocals_file = models.FileField(upload_to=mix_track_path,
                                   max_length=255,
                                   blank=True)
    # Path to accompaniment file
    other_file = models.FileField(upload_to=mix_track_path,
                                  max_length=255,
                                  blank=True)
    # Path to bass file
    bass_file = models.FileField(upload_to=mix_track_path,
                                 max_length=255,
                                 blank=True)
    # Path to drums file
    drums_file = models.FileField(upload_to=mix_track_path,
                                  max_length=255,
                                  blank=True)
    # Status of source separation task
    status = models.IntegerField(choices=TaskStatus.choices,
                                 default=TaskStatus.QUEUED)
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

    def formatted_prefix(self):
        """
        Produce a string with the format like:
        "Artist - Title"
        """
        return f'{self.source_track.artist} - {self.source_track.title}'

    def formatted_suffix(self):
        """
        Produce a string describing the separator model and random shift value:
        "[Demucs, 0]"
        """
        return f'[{self.separator}, {self.random_shifts}]'

    def vocals_url(self):
        """Get the URL of the vocals file."""
        if self.vocals_file:
            return self.vocals_file.url
        return ''

    def other_url(self):
        """Get the URL of the accompaniment file."""
        if self.other_file:
            return self.other_file.url
        return ''

    def bass_url(self):
        """Get the URL of the bass file."""
        if self.bass_file:
            return self.bass_file.url
        return ''

    def drums_url(self):
        """Get the URL of the drums file."""
        if self.drums_file:
            return self.drums_file.url
        return ''

    def source_path(self):
        """Get the path to the source file."""
        return self.source_track.source_file.file.path

    def source_url(self):
        """Get the URL of the source file."""
        return self.source_track.source_file.file.url

    class Meta:
        unique_together = [['source_track']]
