# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

SECRET_KEY = 'default'

ALLOWED_HOSTS = ['0.0.0.0', '127.0.0.1', 'localhost']

# DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
# OR
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}
