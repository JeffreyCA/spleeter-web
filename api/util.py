import re

from api.models import OutputFormat

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

def is_bitrate_lossy(bitrate: int):
    return bitrate != OutputFormat.FLAC.value and bitrate != OutputFormat.WAV.value

def bitrate_to_ext(bitrate: int):
    if bitrate == OutputFormat.FLAC.value:
        return 'flac'
    elif bitrate == OutputFormat.WAV.value:
        return 'wav'
    else:
        return 'mp3'
