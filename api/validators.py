from django.conf import settings
from django.core.exceptions import ValidationError
import os
import magic
from .youtubedl import get_meta_info
from youtube_dl.utils import DownloadError

def is_valid_size(value):
    if value.size > settings.UPLOAD_FILE_SIZE_LIMIT:
        raise ValidationError('File too large.')

def is_valid_audio_file(file):
    first_bytes = file.read(1024)
    file_mime_type = magic.from_buffer(first_bytes, mime=True)
    if file_mime_type == 'application/octet-stream':
        file_type = magic.from_buffer(first_bytes)
        if 'Audio file' not in file_type:
            raise ValidationError('File type not allowed.')
    elif file_mime_type not in settings.VALID_MIME_TYPES:
        raise ValidationError('File type not allowed.')

    ext = os.path.splitext(file.name)[1]
    if ext.lower() not in settings.VALID_FILE_EXT:
        raise ValidationError('File extension not allowed.')

def is_valid_youtube(link):
    try:
        info = get_meta_info(link)
        if info['duration'] > settings.YOUTUBE_LENGTH_LIMIT:
            raise ValidationError('Video length too long.')
    except DownloadError:
        raise ValidationError('Invalid YouTube link')
