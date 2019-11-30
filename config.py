DEBUG = True # Turns on debugging features in Flask
AUDIO_FORMAT = 'mp3'
AUDIO_BITRATE = '128k'
AUDIO_SAMPLE_RATE = 44100
TRACK_NAME = 'track'

SPLEETER_STEM = 'spleeter:4stems'
UPLOAD_FOLDER = '/Users/jeffrey/Dev/spleeter-web/uploads'
OUTPUT_FOLDER = '/Users/jeffrey/Dev/spleeter-web/output'

MAX_CONTENT_LENGTH = 40 * 1024 * 1024

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
