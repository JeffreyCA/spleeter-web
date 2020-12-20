import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.getenv('SECRET_KEY', 'sekrit')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

ALLOWED_HOSTS = [os.getenv('APP_HOST'), '0.0.0.0', '127.0.0.1', 'localhost']

# DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
# OR
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

AZURE_ACCOUNT_KEY = os.getenv('AZURE_ACCOUNT_KEY', '')
AZURE_ACCOUNT_NAME = os.getenv('AZURE_ACCOUNT_NAME', '')
AZURE_CONTAINER = os.getenv('AZURE_CONTAINER', '')

CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
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
        'NAME': 'spleeter-web.sqlite3',
    }
}

MEDIA_ROOT = 'media'
MEDIA_URL = '/media/'
SEPARATE_DIR = 'separate'
UPLOAD_DIR = 'uploads'

VALID_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'video/mpeg',
                    'video/x-mpeg', 'audio/flac', 'audio/x-flac', 'audio/wav', 'audio/x-wav']
VALID_FILE_EXT = ['.mp3', '.flac', '.wav']
UPLOAD_FILE_SIZE_LIMIT = 30 * 1024 * 1024
YOUTUBE_LENGTH_LIMIT = 20 * 60
YOUTUBE_MAX_RETRIES = 3
STALE_TASK_MIN_THRESHOLD = 15

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
    from .settings_dev import *
