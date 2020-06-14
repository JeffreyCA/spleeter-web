import os

SECRET_KEY = 'default'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['0.0.0.0', '127.0.0.1', 'localhost']

# DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
# OR
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'spleeter-web.sqlite3',
    }
}

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}

HUEY = {
    'huey_class': 'huey.SqliteHuey',
    'results': False,
    'immediate': False,
    'consumer': {
        'workers': int(os.getenv('HUEY_WORKERS', '1')),
    },
}
