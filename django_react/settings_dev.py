# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

SECRET_KEY = 'default'

ALLOWED_HOSTS = ['*']

DEFAULT_FILE_STORAGE = 'api.storage.FileSystemStorage'
# DEFAULT_FILE_STORAGE = 'api.storage.S3Boto3Storage'
# DEFAULT_FILE_STORAGE = 'api.storage.AzureStorage'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}
