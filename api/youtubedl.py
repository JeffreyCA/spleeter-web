from __future__ import unicode_literals
from youtube_dl import YoutubeDL
from youtube_dl.utils import DownloadError, ExtractorError
from youtube_title_parse import get_artist_title
from pprint import pprint
import os
from django.conf import settings

def get_file_ext(url):
    OPTS = {
        'format': 'bestaudio/best',
        'forcefilename': True
    }
    # Try up to 3 times
    for _ in range(settings.YOUTUBE_MAX_RETRIES):
        try:
            with YoutubeDL(OPTS) as ydl:
                info = ydl.extract_info(url, download=False)
                filename = ydl.prepare_filename(info)
                _, file_extension = os.path.splitext(filename)
                return file_extension
        except DownloadError:
            pass
    raise Exception('get_file_ext failed')

def get_meta_info(url):
    OPTS = {
        'format': 'bestaudio/best',
        'forcefilename': True
    }
    # Try up to 3 times
    for _ in range(settings.YOUTUBE_MAX_RETRIES):
        try:
            with YoutubeDL(OPTS) as ydl:
                info = ydl.extract_info(url, download=False)
                filename = ydl.prepare_filename(info)

                parsed_artist = ''
                parsed_title = ''

                result = get_artist_title(info['title'])
                if result:
                    parsed_artist, parsed_title = result

                metadata = {
                    'title': info['title'],
                    'uploader': info['uploader'],
                    'embedded_artist': info['artist'],
                    'embedded_title': info['track'],
                    'parsed_artist': parsed_artist,
                    'parsed_title': parsed_title,
                    'duration': info['duration'],
                    'url': info['webpage_url'],
                    'filename': filename
                }
                return metadata
        except DownloadError:
            pass
    raise Exception('get_meta_info failed')

def download_audio(url, dir_path):
    OPTS = {
        'format': 'bestaudio/best',
        'forcefilename': True,
        'outtmpl': str(dir_path),
        'cachedir': False
    }

    # Retry mechanism handled on Huey's side
    with YoutubeDL(OPTS) as ydl:
        info = ydl.extract_info(url, download=False)
        if info['duration'] > settings.YOUTUBE_LENGTH_LIMIT:
            raise Exception('Video length too long')
        ydl.download([url])
