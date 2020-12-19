from __future__ import unicode_literals
import os

from django.conf import settings
from youtube_dl import YoutubeDL
from youtube_dl.utils import DownloadError
from youtube_title_parse import get_artist_title

"""
This module contains functions related to downloading/parsing YouTube links with youtubedl.
"""

def get_file_ext(url):
    """
    Get the file extension of the audio file that would be extracted from the
    given YouTube video URL.

    :param url: YouTube video URL
    """
    opts = {
    # Always use the best audio quality available
        'format': 'bestaudio/best',
        'forcefilename': True,
        'noplaylist': True
    }
    # Try up to 3 times as youtubedl tends to be flakey
    for _ in range(settings.YOUTUBE_MAX_RETRIES):
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                filename = ydl.prepare_filename(info)
                _, file_extension = os.path.splitext(filename)
                return file_extension
        except DownloadError:
            # Allow for retry
            pass
    raise Exception('get_file_ext failed')

def get_meta_info(url):
    """
    Get metadata info from YouTube video.

    :param url: YouTube video URL
    """
    opts = {
        'format': 'bestaudio/best',
        'forcefilename': True,
        'noplaylist': True
    }
    # Try up to 3 times, as youtubedl tends to be flakey
    for _ in range(settings.YOUTUBE_MAX_RETRIES):
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                filename = ydl.prepare_filename(info)

                parsed_artist = ''
                parsed_title = ''

                # Use youtube_title_parse library to attempt to parse the YouTube video title into
                # the track's artist and title.
                result = get_artist_title(info['title'])
                if result:
                    parsed_artist, parsed_title = result

                metadata = {
                # YT video title
                    'title': info['title'],
                # YT video uploader
                    'uploader': info['uploader'],
                # YT video's embedded track artist (some official songs)
                    'embedded_artist': info['artist'],
                # YT video's embedded track title (some official songs)
                    'embedded_title': info['track'],
                # Artist name parsed from the YouTube video title
                    'parsed_artist': parsed_artist,
                # Title parsed from the YouTube video title
                    'parsed_title': parsed_title,
                # Duration of YouTube video in seconds
                    'duration': info['duration'],
                # YouTube video URL
                    'url': info['webpage_url'],
                # Filename (including extension)
                    'filename': filename
                }
                return metadata
        except DownloadError:
            # Allow for retry
            pass
    raise DownloadError('Unable to parse YouTube link')

def download_audio(url, dir_path):
    """
    Extract audio track from YouTube video and save to given path.

    :param url: YouTube video URL
    :param dir_path: Path to save audio file
    """
    opts = {
        'format': 'bestaudio/best',
        'forcefilename': True,
        'outtmpl': str(dir_path),
        'cachedir': False,
        'noplaylist': True
    }

    # Retry mechanism is handled on Celery's side
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if info['duration'] > settings.YOUTUBE_LENGTH_LIMIT:
            raise Exception('Video length too long')
        ydl.download([url])
