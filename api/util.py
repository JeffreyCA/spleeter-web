import re

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
