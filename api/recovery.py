import os
import re
import urllib.parse
import uuid
from datetime import datetime, timezone

import mutagen
from django.conf import settings
from django.db import IntegrityError, transaction
from mutagen.easyid3 import EasyID3

from .models import (BS_ROFORMER_5S_GUITAR, BS_ROFORMER_5S_PIANO,
                     BS_ROFORMER_6S, BS_ROFORMER_FAMILY, D3NET, DEMUCS_FAMILY,
                     SPLEETER, SPLEETER_PIANO, XUMX, DynamicMix, SourceFile,
                     SourceTrack, StaticMix, TaskStatus)
from .util import get_valid_filename

"""
This module implements best-effort recovery of lost database entries from the files
remaining in the media directory (see GitHub discussion #1968).

Media paths embed the UUID primary keys of their rows (media/uploads/<SourceFile.id>/,
media/separate/<StaticMix.id or DynamicMix.id>/), and mix filenames encode metadata in
the format produced by StaticMix.formatted_name()/DynamicMix.formatted_suffix():

    {Artist - Title} ({parts}) [{bitrate display},{separator}{extras}].ext

Parsing is lossy (filenames were sanitized with get_valid_filename), so recovered
metadata is a best-effort starting point that the user reviews before importing.
"""

KNOWN_SEPARATORS = frozenset([SPLEETER, SPLEETER_PIANO, D3NET, XUMX] +
                             BS_ROFORMER_FAMILY + DEMUCS_FAMILY)
PIANO_SEPARATORS = frozenset(
    [SPLEETER_PIANO, BS_ROFORMER_5S_PIANO, BS_ROFORMER_6S])
GUITAR_SEPARATORS = frozenset([BS_ROFORMER_5S_GUITAR, BS_ROFORMER_6S])

STEM_NAMES = frozenset(
    ['vocals', 'drums', 'bass', 'other', 'piano', 'guitar'])
STEM_ORDER = ['vocals', 'drums', 'bass', 'piano', 'guitar', 'other']

# Inverse of OutputFormat labels used in mix filename suffixes
BITRATE_DISPLAY_TO_VALUE = {
    '192 kbps': 192,
    '256 kbps': 256,
    '320 kbps': 320,
    'WAV': 0,
    'FLAC': 1
}
DEFAULT_BITRATE = 256

# Mix output files are only ever MP3/WAV/FLAC (see api.util.output_format_to_ext)
MIX_FILE_EXTS = frozenset(['.mp3', '.wav', '.flac'])

# settings.VALID_FILE_EXT only covers what users may upload, but uploads/ also holds
# YouTube downloads, which are named after the format yt-dlp fetched (see
# api.youtubedl.download_audio). Its audio formats are all upload-legal, but the
# 'bestaudio/best' fallback can yield a video container, and older downloads were
# named from a guessed extension that did not always match the file. Those files are
# already on disk, so recovery reads anything yt-dlp can leave behind.
UPLOAD_FILE_EXTS = frozenset(settings.VALID_FILE_EXT) | frozenset(
    ['.mp4', '.m4v', '.mkv', '.mov', '.avi', '.flv', '.3gp'])

# The greedy prefix binds to the *last* "(parts) [suffix]" group, so titles that
# themselves contain parentheses parse correctly.
MIX_FILENAME_RE = re.compile(
    r'^(?P<prefix>.*) \((?P<parts>[a-z,]+)\) \[(?P<suffix>[^\[\]]*)\]\.(?P<ext>[A-Za-z0-9]+)$'
)


def storage_is_local():
    """Return whether the default file storage is the local filesystem."""
    return settings.DEFAULT_FILE_STORAGE == 'api.storage.FileSystemStorage'


def parse_mix_suffix(suffix):
    """Parse the bracketed suffix of a mix filename into model fields.

    Tolerates legacy formats found in real media directories (extra trailing
    tokens, bare-bitrate D3Net suffixes). Always returns a separator from
    KNOWN_SEPARATORS with separator_args shaped so that get_extra_info() and
    formatted_name()/formatted_suffix() never raise KeyError. 'normalized' is
    True when unrecognized values were replaced with defaults.

    :param suffix: Suffix content between brackets, e.g. '256 kbps,htdemucs,0 shifts'
    :return: Dict with 'separator', 'separator_args', 'bitrate', 'normalized'
    """
    tokens = [t.strip() for t in suffix.split(',')] if suffix else []
    normalized = False

    if tokens and tokens[0] in BITRATE_DISPLAY_TO_VALUE:
        bitrate = BITRATE_DISPLAY_TO_VALUE[tokens[0]]
    else:
        bitrate = DEFAULT_BITRATE
        normalized = True

    if len(tokens) < 2:
        # Current D3Net dynamic mix suffixes contain only the bitrate
        separator = D3NET
        separator_args = {}
    else:
        separator = tokens[1]
        if separator in DEMUCS_FAMILY:
            random_shifts = 0
            for token in tokens[2:]:
                match = re.fullmatch(r'(\d+) shifts', token)
                if match:
                    random_shifts = int(match.group(1))
            separator_args = {'random_shifts': random_shifts}
        elif separator == XUMX:
            iterations = 0
            softmask = False
            alpha = 1.0
            for token in tokens[2:]:
                match = re.fullmatch(r'(\d+) iter', token)
                if match:
                    iterations = int(match.group(1))
                    continue
                match = re.fullmatch(r'softmask (\S+)', token)
                if match:
                    softmask = True
                    try:
                        alpha = float(match.group(1).replace('_', '.'))
                    except ValueError:
                        pass
            separator_args = {
                'iterations': iterations,
                'softmask': softmask,
                'alpha': alpha
            }
        elif separator in KNOWN_SEPARATORS:
            # Ignore trailing tokens (legacy formats like 'spleeter_5stems,1 iter')
            separator_args = {}
        else:
            separator = SPLEETER
            separator_args = {}
            normalized = True

    return {
        'separator': separator,
        'separator_args': separator_args,
        'bitrate': bitrate,
        'normalized': normalized
    }


def parse_mix_filename(filename):
    """Parse a mix filename into its prefix, parts, and separator information.

    :param filename: Base name of a mix file
    :return: Dict with 'prefix', 'parts', 'parsed', plus parse_mix_suffix() fields
    """
    match = MIX_FILENAME_RE.match(filename)
    if match:
        parts = match.group('parts').split(',')
        if set(parts) <= STEM_NAMES:
            info = parse_mix_suffix(match.group('suffix'))
            info.update({
                'prefix': match.group('prefix'),
                'parts': parts,
                'parsed': True
            })
            return info
    return {
        'prefix': os.path.splitext(filename)[0],
        'parts': [],
        'parsed': False,
        'separator': SPLEETER,
        'separator_args': {},
        'bitrate': DEFAULT_BITRATE,
        'normalized': True
    }


def split_artist_title(prefix):
    """Split an 'Artist - Title' string on the first separator occurrence.

    :param prefix: Combined artist/title string
    :return: Tuple of (artist, title); artist is empty if no separator found
    """
    if ' - ' in prefix:
        artist, title = prefix.split(' - ', 1)
        return artist.strip(), title.strip()
    return '', prefix.strip()


def read_tags(path):
    """Extract artist and title from a local audio file's tags (best-effort).

    :param path: Absolute or CWD-relative path to the audio file
    :return: Tuple of (artist, title); empty strings when unavailable
    """
    artist = ''
    title = ''
    try:
        audio = EasyID3(path) if path.endswith('mp3') else mutagen.File(path)
        if audio:
            if 'artist' in audio:
                artist = str(audio['artist'][0])
            if 'title' in audio:
                title = str(audio['title'][0])
    except:
        pass
    return artist, title


def media_file_url(*parts):
    """Build the URL of a file under MEDIA_URL from its path components."""
    return settings.MEDIA_URL + '/'.join(
        urllib.parse.quote(part) for part in parts)


def is_uuid(name):
    """Return whether the given string is a valid UUID."""
    try:
        uuid.UUID(name)
        return True
    except (ValueError, TypeError):
        return False


def file_mtime(path):
    """Return the file's modification time as an aware UTC datetime."""
    return datetime.fromtimestamp(os.path.getmtime(path), tz=timezone.utc)


def list_files_with_ext(dir_path, extensions):
    """List files in a directory whose extension is in the given set.

    Media directories can live on slow bind mounts (a Docker Desktop host
    mount, say), where every syscall is expensive, so this checks the
    extension before asking whether the entry is a file, and uses scandir so
    that the answer usually comes from the directory listing itself rather
    than a stat call per entry.

    :param dir_path: Directory to list
    :param extensions: Set of lowercase extensions including the dot
    :return: Sorted list of matching file names
    """
    result = []
    try:
        with os.scandir(dir_path) as entries:
            for entry in entries:
                if os.path.splitext(entry.name)[1].lower() not in extensions:
                    continue
                if entry.is_file():
                    result.append(entry.name)
    except OSError:
        # Missing directory, or a file where a directory was expected
        return []
    result.sort()
    return result


def find_upload_file(dir_id):
    """Find the audio file inside an upload directory.

    :param dir_id: Name of the media/uploads subdirectory (a UUID string)
    :return: File name, or None if the directory has no valid audio file
    """
    dir_path = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR, dir_id)
    files = list_files_with_ext(dir_path, UPLOAD_FILE_EXTS)
    return files[0] if files else None


def parse_mix_dir(dir_id):
    """Inspect a media/separate subdirectory and parse its contents.

    :param dir_id: Name of the media/separate subdirectory (a UUID string)
    :return: Dict describing the directory, or None if it has no mix files
    """
    dir_path = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR, dir_id)
    files = list_files_with_ext(dir_path, MIX_FILE_EXTS)
    if not files:
        return None

    # Use the first parseable filename for shared metadata
    parses = [parse_mix_filename(filename) for filename in files]
    primary = next((p for p in parses if p['parsed']), parses[0])

    # Map stems to files for dynamic mixes
    stem_files = {}
    for filename, parse in zip(files, parses):
        if parse['parsed'] and len(parse['parts']) == 1:
            stem_files.setdefault(parse['parts'][0], filename)

    if len(files) == 1:
        mix_type = 'static'
        parts = primary['parts']
    else:
        mix_type = 'dynamic'
        parts = [stem for stem in STEM_ORDER if stem in stem_files]

    # Default the row-level preview to the accompaniment ('other') stem
    preview_file = stem_files.get('other') or stem_files.get(
        'vocals') or files[0]

    return {
        'preview_url': media_file_url(settings.SEPARATE_DIR, dir_id,
                                      preview_file),
        'stem_urls': {
            stem: media_file_url(settings.SEPARATE_DIR, dir_id, filename)
            for stem, filename in stem_files.items()
        } if mix_type == 'dynamic' else {},
        'type': mix_type,
        'files': files,
        'stem_files': stem_files,
        'parts': parts,
        'prefix': primary['prefix'],
        'parsed': primary['parsed'],
        'normalized': primary['normalized'],
        'separator': primary['separator'],
        'separator_args': primary['separator_args'],
        'bitrate': primary['bitrate'],
        'date': file_mtime(os.path.join(dir_path, files[0]))
    }


def match_key(artist, title):
    """Build the lookup key used to match mix filename prefixes to tracks.

    Mix filename prefixes were produced by get_valid_filename('Artist - Title'),
    so candidate keys are sanitized the same way before comparison.
    """
    return get_valid_filename(f'{artist} - {title}').strip().lower()


def scan_uploads():
    """Scan media/uploads for directories not present in the database.

    :return: List of dicts describing recoverable uploads
    """
    results = []
    uploads_root = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR)
    if not os.path.isdir(uploads_root):
        return results
    existing_ids = {
        str(pk)
        for pk in SourceFile.objects.values_list('id', flat=True)
    }
    for name in sorted(os.listdir(uploads_root)):
        if not is_uuid(name) or name in existing_ids:
            continue
        filename = find_upload_file(name)
        if filename is None:
            continue
        file_path = os.path.join(uploads_root, name, filename)
        tag_artist, tag_title = read_tags(file_path)
        fn_artist, fn_title = split_artist_title(os.path.splitext(filename)[0])
        results.append({
            'id': name,
            'filename': filename,
            'url': media_file_url(settings.UPLOAD_DIR, name, filename),
            'artist': tag_artist or fn_artist,
            'title': tag_title or fn_title,
            'date': file_mtime(file_path).isoformat()
        })
    return results


def scan_mixes():
    """Scan media/separate for directories not present in the database.

    Mixes are only matched against tracks that currently exist in the database,
    so uploads should be recovered first; a rescan will then match their mixes.

    :return: List of dicts describing recoverable mixes
    """
    results = []
    separate_root = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR)
    if not os.path.isdir(separate_root):
        return results
    existing_ids = {
        str(pk)
        for pk in StaticMix.objects.values_list('id', flat=True)
    } | {
        str(pk)
        for pk in DynamicMix.objects.values_list('id', flat=True)
    }

    lookup = {}
    for track in SourceTrack.objects.all():
        key = match_key(track.artist, track.title)
        # Several tracks can share a name, and picking one of them arbitrarily
        # would silently attach mixes to the wrong track, so mark the name as
        # ambiguous and leave the choice to the user
        lookup[key] = None if key in lookup else {
            'kind': 'track',
            'id': str(track.id)
        }

    for name in sorted(os.listdir(separate_root)):
        if not is_uuid(name) or name in existing_ids:
            continue
        info = parse_mix_dir(name)
        if info is None:
            continue
        artist, title = split_artist_title(info['prefix'])
        match = lookup.get(info['prefix'].strip().lower())
        results.append({
            'id': name,
            'type': info['type'],
            'files': info['files'],
            'preview_url': info['preview_url'],
            'stem_urls': info['stem_urls'],
            'prefix': info['prefix'],
            'artist': artist,
            'title': title,
            'parts': info['parts'],
            'separator': info['separator'],
            'separator_args': info['separator_args'],
            'bitrate': info['bitrate'],
            'parsed': info['parsed'],
            'normalized': info['normalized'],
            'match': match,
            'date': info['date'].isoformat()
        })
    return results


def perform_scan():
    """Scan the media directory for recoverable uploads and mixes.

    :return: Dict with 'uploads', 'mixes', and 'existing_tracks'
    """
    uploads = scan_uploads()
    mixes = scan_mixes()
    # The file is what tells two tracks with the same artist and title apart,
    # so its path is sent along for the source track picker
    existing_tracks = [{
        'id': str(track.id),
        'artist': track.artist,
        'title': track.title,
        'path': track.source_file.file.name if track.source_file.file else ''
    } for track in SourceTrack.objects.select_related('source_file').all()]
    return {
        'uploads': uploads,
        'mixes': mixes,
        'existing_tracks': existing_tracks
    }


def import_upload(item):
    """Import a single upload directory as a SourceFile + SourceTrack.

    :param item: Dict with 'id' and user-reviewed 'artist'/'title'
    :return: Result dict with 'id', 'status', and optional 'detail'/'track_id'
    """
    dir_id = str(item.get('id', ''))
    if not is_uuid(dir_id):
        return {'id': dir_id, 'status': 'error', 'detail': 'Invalid ID'}
    if SourceFile.objects.filter(id=dir_id).exists():
        return {'id': dir_id, 'status': 'skipped', 'detail': 'Already exists'}
    filename = find_upload_file(dir_id)
    if filename is None:
        return {
            'id': dir_id,
            'status': 'error',
            'detail': 'No audio file found in directory'
        }

    file_path = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR, dir_id,
                             filename)
    artist = str(item.get('artist', '')).strip()
    title = str(item.get('title', '')).strip()
    if not title:
        tag_artist, tag_title = read_tags(file_path)
        fn_artist, fn_title = split_artist_title(os.path.splitext(filename)[0])
        artist = artist or tag_artist or fn_artist
        title = tag_title or fn_title

    try:
        with transaction.atomic():
            source_file = SourceFile(id=dir_id, is_youtube=False)
            # Assign the path directly, like the Celery tasks do
            source_file.file.name = os.path.join(settings.UPLOAD_DIR, dir_id,
                                                 filename)
            source_file.save()
            track = SourceTrack(source_file=source_file,
                                artist=artist,
                                title=title)
            track.save()
            # date_created is auto_now_add, so it must be backfilled separately
            SourceTrack.objects.filter(id=track.id).update(
                date_created=file_mtime(file_path))
    except IntegrityError as error:
        return {'id': dir_id, 'status': 'skipped', 'detail': str(error)}
    except Exception as error:
        return {'id': dir_id, 'status': 'error', 'detail': str(error)}

    return {'id': dir_id, 'status': 'imported', 'track_id': str(track.id)}


def create_placeholder(item):
    """Create a placeholder SourceTrack (with an empty SourceFile) for mixes
    whose original upload no longer exists.

    :param item: Dict with 'artist' and 'title'
    :return: Result dict with 'id', 'status', and optional 'detail'/'track_id'
    """
    artist = str(item.get('artist', '')).strip()
    title = str(item.get('title', '')).strip()
    label = f'{artist} - {title}' if artist else title
    if not title:
        return {'id': label, 'status': 'error', 'detail': 'Title is required'}
    if SourceTrack.objects.filter(artist__iexact=artist,
                                  title__iexact=title).exists():
        return {
            'id': label,
            'status': 'skipped',
            'detail': 'A track with this name already exists'
        }
    try:
        with transaction.atomic():
            source_file = SourceFile(is_youtube=False)
            source_file.save()
            track = SourceTrack(source_file=source_file,
                                artist=artist,
                                title=title)
            track.save()
    except Exception as error:
        return {'id': label, 'status': 'error', 'detail': str(error)}
    return {'id': label, 'status': 'imported', 'track_id': str(track.id)}


def import_mix(item):
    """Import a single mix directory as a StaticMix or DynamicMix.

    :param item: Dict with 'id' and a 'track' association
    :return: Result dict with 'id', 'status', and optional 'detail'/'track_id'
    """
    dir_id = str(item.get('id', ''))
    if not is_uuid(dir_id):
        return {'id': dir_id, 'status': 'error', 'detail': 'Invalid ID'}
    if StaticMix.objects.filter(id=dir_id).exists() or DynamicMix.objects.filter(
            id=dir_id).exists():
        return {'id': dir_id, 'status': 'skipped', 'detail': 'Already exists'}
    info = parse_mix_dir(dir_id)
    if info is None:
        return {
            'id': dir_id,
            'status': 'error',
            'detail': 'No mix files found in directory'
        }

    association = item.get('track') or {}
    if association.get('kind') != 'track':
        return {
            'id': dir_id,
            'status': 'error',
            'detail': 'No source track selected'
        }
    track = SourceTrack.objects.filter(
        id=str(association.get('id', ''))).first()
    if track is None:
        return {
            'id': dir_id,
            'status': 'error',
            'detail': 'Associated track not found'
        }

    try:
        with transaction.atomic():
            if info['type'] == 'static':
                mix = StaticMix(id=dir_id,
                                celery_id=None,
                                separator=info['separator'],
                                separator_args=info['separator_args'],
                                bitrate=info['bitrate'],
                                source_track=track,
                                vocals='vocals' in info['parts'],
                                drums='drums' in info['parts'],
                                bass='bass' in info['parts'],
                                other='other' in info['parts'],
                                piano=('piano' in info['parts'])
                                if info['separator'] in PIANO_SEPARATORS else None,
                                guitar=('guitar' in info['parts'])
                                if info['separator'] in GUITAR_SEPARATORS else None,
                                status=TaskStatus.DONE,
                                error='')
                mix.file.name = os.path.join(settings.SEPARATE_DIR, dir_id,
                                             info['files'][0])
                mix.save()
                StaticMix.objects.filter(id=dir_id).update(
                    date_created=info['date'], date_finished=info['date'])
            else:
                mix = DynamicMix(id=dir_id,
                                 celery_id=None,
                                 separator=info['separator'],
                                 separator_args=info['separator_args'],
                                 bitrate=info['bitrate'],
                                 source_track=track,
                                 status=TaskStatus.DONE,
                                 error='')
                for stem in ['vocals', 'other', 'bass', 'drums', 'piano', 'guitar']:
                    if stem in info['stem_files']:
                        getattr(mix, f'{stem}_file').name = os.path.join(
                            settings.SEPARATE_DIR, dir_id,
                            info['stem_files'][stem])
                mix.save()
                DynamicMix.objects.filter(id=dir_id).update(
                    date_created=info['date'], date_finished=info['date'])
    except IntegrityError as error:
        return {'id': dir_id, 'status': 'skipped', 'detail': str(error)}
    except Exception as error:
        return {'id': dir_id, 'status': 'error', 'detail': str(error)}

    return {'id': dir_id, 'status': 'imported', 'track_id': str(track.id)}


def perform_import(data):
    """Import the user-confirmed uploads, placeholder tracks, and mixes.

    Each item is imported in its own transaction; failures are reported per
    item and never abort the batch. Mixes can only be associated with tracks
    that already exist in the database, so uploads and placeholder tracks are
    expected to be created before their mixes.

    :param data: Dict with 'uploads', 'placeholders', and 'mixes' lists
    :return: Dict with per-item result lists for each of the three
    """
    upload_results = [
        import_upload(item) for item in data.get('uploads', [])
    ]
    placeholder_results = [
        create_placeholder(item) for item in data.get('placeholders', [])
    ]
    mix_results = [import_mix(item) for item in data.get('mixes', [])]
    return {
        'uploads': upload_results,
        'placeholders': placeholder_results,
        'mixes': mix_results
    }
