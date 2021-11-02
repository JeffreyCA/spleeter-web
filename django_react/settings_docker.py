import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.getenv('SECRET_KEY', 'default')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

CPU_SEPARATION = bool(int(os.getenv('CPU_SEPARATION', '1')))

ALLOWED_HOSTS = [os.getenv('APP_HOST'), '0.0.0.0', '127.0.0.1', 'localhost']

DEFAULT_FILE_STORAGE = os.getenv('DEFAULT_FILE_STORAGE', 'api.storage.FileSystemStorage')
if DEFAULT_FILE_STORAGE != 'api.storage.FileSystemStorage':
    storage_type = DEFAULT_FILE_STORAGE.upper()
    if storage_type == 'AWS':
        DEFAULT_FILE_STORAGE = 'api.storage.S3Boto3Storage'
    elif storage_type == 'AZURE':
        DEFAULT_FILE_STORAGE = 'api.storage.AzureStorage'
    else:
        DEFAULT_FILE_STORAGE = 'api.storage.FileSystemStorage'
# DEFAULT_FILE_STORAGE = 'api.storage.AzureStorage'
# DEFAULT_FILE_STORAGE = 'api.storage.S3Boto3Storage'
# DEFAULT_FILE_STORAGE = 'api.storage.FileSystemStorage'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

##################################
# Azure storage backend settings #
##################################
AZURE_ACCOUNT_KEY = os.getenv('AZURE_ACCOUNT_KEY', '')
AZURE_ACCOUNT_NAME = os.getenv('AZURE_ACCOUNT_NAME', '')
AZURE_CONTAINER = os.getenv('AZURE_CONTAINER', '')
AZURE_CUSTOM_DOMAIN = os.getenv('AZURE_CUSTOM_DOMAIN')
AZURE_OBJECT_PARAMETERS = {'content_disposition': 'attachment'}

################################
# AWS storage backend settings #
################################
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', '')
AWS_S3_CUSTOM_DOMAIN = os.getenv('AWS_S3_CUSTOM_DOMAIN')

# A path prefix that will be prepended to all uploads
AWS_LOCATION = 'media'
# Disable query parameter authentication (for public reads)
AWS_QUERYSTRING_AUTH = False
# Make uploaded files publicly accessible and downloadable
AWS_S3_OBJECT_PARAMETERS = {'ACL': 'public-read', 'ContentDisposition': 'attachment'}
# S3 region
AWS_S3_REGION_NAME = 'us-east-1'

CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
CELERY_TASK_ROUTES = {
    'api.tasks.create_static_mix': {
        'queue': 'slow_queue'
    },
    'api.tasks.create_dynamic_mix': {
        'queue': 'slow_queue'
    },
    'api.tasks.fetch_youtube_audio': {
        'queue': 'fast_queue'
    },
}

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'sqlite', 'spleeter-web.sqlite3'),
    }
}

MEDIA_ROOT = 'media'
MEDIA_URL = '/media/'
SEPARATE_DIR = 'separate'
UPLOAD_DIR = 'uploads'

VALID_MIME_TYPES = [
    'audio/aac', 'audio/aiff', 'audio/x-aiff', 'audio/ogg', 'video/ogg', 'application/ogg', 'audio/opus', 'audio/vorbis', 'audio/mpeg',
    'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'video/mpeg', 'audio/m4a', 'audio/x-m4a', 'audio/x-hx-aac-adts', 'audio/mp4', 'video/x-mpeg', 'audio/flac',
    'audio/x-flac', 'audio/wav', 'audio/x-wav', 'audio/webm', 'video/webm'
]

VALID_FILE_EXT = [
    # Lossless
    '.aif',
    '.aifc',
    '.aiff',
    '.flac',
    '.wav',
    # Lossy
    '.aac',
    '.m4a',
    '.mp3',
    '.opus',
    '.weba',
    '.webm',
    # Ogg (Lossy)
    '.ogg',
    '.oga',
    '.mogg'
]

UPLOAD_FILE_SIZE_LIMIT = 100 * 1024 * 1024
YOUTUBE_LENGTH_LIMIT = 30 * 60
YOUTUBE_MAX_RETRIES = 3

# Application definition
INSTALLED_APPS = [
    'whitenoise.runserver_nostatic',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api.apps.ApiConfig',
    'frontend.apps.FrontendConfig',
    'rest_framework',
    'webpack_loader'
]

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'dist/',
        'STATS_FILE': os.path.join(BASE_DIR, 'frontend', 'assets', 'webpack-stats.json')
    }
}

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

ROOT_URLCONF = 'django_react.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'frontend', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'frontend.context_processors.debug',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_react.wsgi.application'

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'frontend', 'assets'),
)

# Override production variables if DJANGO_DEVELOPMENT env variable is set
if os.getenv('DJANGO_DEVELOPMENT'):
    from .settings_docker_dev import *
