import re

from api.models import OutputFormat

ALL_PARTS = ['vocals', 'other', 'bass', 'drums']
ALL_PARTS_5_PIANO = ['vocals', 'other', 'piano', 'bass', 'drums']
ALL_PARTS_5_GUITAR = ['vocals', 'other', 'guitar', 'bass', 'drums']
ALL_PARTS_6 = ['vocals', 'other', 'piano', 'guitar', 'bass', 'drums']

def get_valid_filename(s):
    """
    Return the given string converted to a string that can be used for a clean
    filename. Remove leading and trailing spaces; remove anything that is not an
    alphanumeric, dash, whitespace, comma, bracket, underscore, or dot.
    >>> get_valid_filename("john's portrait in 2004.jpg")
    'johns_portrait_in_2004.jpg'
    """
    s = str(s).strip()
    return re.sub(r'(?u)[^-\w\s.,[\]()]', '', s)

def is_output_format_lossy(output_format: int):
    """Return whether OutputFormat enum is a lossy format."""
    return output_format != OutputFormat.FLAC.value and output_format != OutputFormat.WAV.value

def output_format_to_ext(output_format: int):
    """Resolve OutputFormat enum to a file extension."""
    if output_format == OutputFormat.FLAC.value:
        return 'flac'
    elif output_format == OutputFormat.WAV.value:
        return 'wav'
    else:
        return 'mp3'
