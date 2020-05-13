from datetime import timedelta
import os
import os.path
import pathlib

from django.core.files import File
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils import timezone

from huey import crontab
from huey.contrib.djhuey import task, periodic_task

from .models import SeparatedSong, YouTubeFetchTask
from .separate import SpleeterSeparator
from .youtubedl import *

# Check for stale song separation tasks and mark them as erroneous
@periodic_task(crontab(minute='*/30'))
def check_in_progress_tasks():
    time_threshold = timezone.now() - timedelta(minutes=settings.STALE_TASK_MIN_THRESHOLD)
    in_progress_songs = SeparatedSong.objects.filter(status=SeparatedSong.Status.IN_PROGRESS, date_created__lte=time_threshold)
    in_progress_songs.update(status=SeparatedSong.Status.ERROR, error='Operation timed out')

@task()
def separate_task(separate_song):
    separate_song.status = SeparatedSong.Status.IN_PROGRESS
    separate_song.save()
    try:
        # Get paths
        directory = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR, str(separate_song.id))
        filename = separate_song.formatted_name() + '.mp3'
        rel_media_path = os.path.join(settings.SEPARATE_DIR, str(separate_song.id), filename)
        rel_path = os.path.join(settings.MEDIA_ROOT, rel_media_path)
        pathlib.Path(directory).mkdir(parents=True, exist_ok=True)

        parts = {
            'vocals': separate_song.vocals,
            'drums': separate_song.drums,
            'bass': separate_song.bass,
            'other': separate_song.other
        }
        separator = SpleeterSeparator()
        is_local = settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage'

        if is_local:
            separator.predict(parts, separate_song.source_path(), rel_path)
        else:
            separator.predict(parts, separate_song.source_url(), rel_path)

        # Check file exists
        if os.path.exists(rel_path):
            separate_song.status = SeparatedSong.Status.DONE
            if is_local:
                # File is already on local filesystem
                separate_song.file.name = rel_media_path
            else:
                # Need to copy local file to S3/Azure Blob/etc.
                raw_file = open(rel_path, 'rb')
                content_file = ContentFile(raw_file.read())
                content_file.name = filename
                separate_song.file = content_file
                rel_dir_path = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR, str(separate_song.id))
                # Remove local file
                os.remove(rel_path)
                # Remove empty directory
                os.rmdir(rel_dir_path)
            separate_song.save()
        else:
            raise Exception('Error writing to file')
    except BaseException as error:
        separate_song.status = SeparatedSong.Status.ERROR
        separate_song.error = str(error)
        separate_song.save()

@task(retries=settings.YOUTUBE_MAX_RETRIES)
def fetch_youtube_audio(source_file, artist, title, link):
    fetch_task = source_file.youtube_fetch_task
    fetch_task.status = YouTubeFetchTask.Status.IN_PROGRESS
    fetch_task.save()

    try:
        # Get paths
        directory = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR, str(source_file.id))
        filename = artist + ' - ' + title + get_file_ext(link)
        rel_media_path = os.path.join(settings.UPLOAD_DIR, str(fetch_task.id), filename)
        rel_path = os.path.join(settings.MEDIA_ROOT, rel_media_path)
        pathlib.Path(directory).mkdir(parents=True, exist_ok=True)
        download_audio(link, rel_path)
        is_local = settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage'

        # Check file exists
        if os.path.exists(rel_path):
            fetch_task.status = YouTubeFetchTask.Status.DONE
            if is_local:
                # File is already on local filesystem
                source_file.file.name = rel_media_path
            else:
                # Need to copy local file to S3/Azure Blob/etc.
                raw_file = open(rel_path, 'rb')
                content_file = ContentFile(raw_file.read())
                content_file.name = filename
                source_file.file = content_file
                rel_dir_path = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR, str(source_file.id))
                # Remove local file
                os.remove(rel_path)
                # Remove empty directory
                os.rmdir(rel_dir_path)
            fetch_task.save()
            source_file.save()
        else:
            raise Exception('Error writing to file')
    except BaseException as error:
        fetch_task.status = YouTubeFetchTask.Status.ERROR
        fetch_task.error = str(error)
        fetch_task.save()
        raise error
