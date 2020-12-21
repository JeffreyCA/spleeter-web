# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

SECRET_KEY = 'default'

ALLOWED_HOSTS = ['0.0.0.0', '127.0.0.1', 'localhost']

DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
# DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}
