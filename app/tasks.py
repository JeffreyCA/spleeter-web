import os
import os.path
import pathlib

from django.core.files import File
from django.conf import settings
from huey.contrib.djhuey import task

from .models import SeparatedSong
from .separate import SpleeterSeparator

@task()
def separate_task(separate_song):
    separate_song.status = SeparatedSong.Status.IN_PROGRESS
    separate_song.save()
    try:
        directory = os.path.join(settings.MEDIA_ROOT, 'separate', str(separate_song.id))
        filename = separate_song.formatted_name() + '.mp3'
        rel_media_path = os.path.join('separate', str(separate_song.id), filename)
        rel_path = os.path.join(settings.MEDIA_ROOT, rel_media_path)
        pathlib.Path(directory).mkdir(parents=True, exist_ok=True)

        separator = SpleeterSeparator()
        separator.predict(separate_song.source_path(), rel_path)

        if os.path.exists(rel_path):
            separate_song.status = SeparatedSong.Status.DONE
            separate_song.file.name = rel_media_path
            separate_song.save()
        else:
            raise Exception('Error writing to file')
    except BaseException as error:
        separate_song.status = SeparatedSong.Status.ERROR
        separate_song.error = str(error)
        separate_song.save()
