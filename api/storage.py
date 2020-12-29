from django.core.files.storage import \
    FileSystemStorage as BaseFileSystemStorage
from django.utils.deconstruct import deconstructible
from storages.backends.azure_storage import AzureStorage as BaseAzureStorage
from storages.backends.s3boto3 import S3Boto3Storage as BaseS3Boto3Storage

from .util import get_valid_filename

"""
Simple wrappers of the base storage backends except that characters like spaces, commas, brackets
are allowed in the filename.
"""

@deconstructible
class FileSystemStorage(BaseFileSystemStorage):
    def get_valid_name(self, name):
        return get_valid_filename(name)

@deconstructible
class S3Boto3Storage(BaseS3Boto3Storage):
    def get_valid_name(self, name):
        return get_valid_filename(name)

@deconstructible
class AzureStorage(BaseAzureStorage):
    def get_valid_name(self, name):
        return get_valid_filename(name)
