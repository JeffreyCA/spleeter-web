from __future__ import unicode_literals

from django.conf import settings
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError
from youtube_title_parse import get_artist_title

"""
This module contains functions related to downloading/parsing YouTube links with youtubedl.
"""

def get_meta_info(url):
    """
    Get metadata info from YouTube video.

    :param url: YouTube video URL
    """
    opts = {
        'format': 'bestaudio/best',
        'forcefilename': True,
        'noplaylist': True,
        'source_address': settings.YOUTUBEDL_SOURCE_ADDR,
        'verbose': settings.YOUTUBEDL_VERBOSE,
        'remote_components': ['ejs:github', 'ejs:npm']
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
                    'embedded_artist': info['artist'] if 'artist' in info else '',
                # YT video's embedded track title (some official songs)
                    'embedded_title': info['track'] if 'track' in info else '',
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
        except KeyError:
            pass
        except DownloadError:
            # Allow for retry
            pass
    raise DownloadError('Unable to parse YouTube link')

def download_audio(url, path_template):
    """
    Extract audio track from YouTube video and save to given path.

    :param url: YouTube video URL
    :param path_template: Output template for the audio file. Must end in '%(ext)s'
                          so the file is named after the format that is actually
                          downloaded (see the return value).
    :return: Path of the file that was written
    """
    opts = {
        'format': 'bestaudio/best',
        'forcefilename': True,
        'outtmpl': str(path_template),
        'cachedir': False,
        'noplaylist': True,
        'source_address': settings.YOUTUBEDL_SOURCE_ADDR,
        'verbose': settings.YOUTUBEDL_VERBOSE,
        'remote_components': ['ejs:github', 'ejs:npm']
    }

    # Retry mechanism is handled on Celery's side
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if info['duration'] > settings.YOUTUBE_LENGTH_LIMIT:
            raise Exception('Video length too long')
        # The format is picked per extraction and can differ between calls, so only
        # the download itself can say what was written and under which extension
        info = ydl.extract_info(url)
        downloads = info.get('requested_downloads') or []
        if downloads and downloads[0].get('filepath'):
            return downloads[0]['filepath']
        return ydl.prepare_filename(info)
