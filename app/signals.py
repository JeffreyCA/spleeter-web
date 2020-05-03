import os
from pathlib import Path

from django.conf import settings
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from .models import *

@receiver(pre_delete, sender=SourceFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    # Delete file on disk before deleting instance
    instance.file.delete()

@receiver(post_save, sender=SourceFile, dispatch_uid='move_upload_file_signal')
def move_upload_file(sender, instance, using, **kwargs):
    # Move upload file into subdirectory by its UUID
    if instance and instance.file and Path(instance.file.url).parent.name == 'uploads':
        old_path = instance.file.url.lstrip('/')
        filename = os.path.basename(old_path)
        new_dir = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR, str(instance.id))
        new_path = os.path.join(new_dir, filename)

        Path(new_dir).mkdir(parents=True, exist_ok=True)
        Path(old_path).rename(new_path)

        new_rel_media_path = os.path.join(settings.UPLOAD_DIR, str(instance.id), filename)
        instance.file.name = new_rel_media_path
        instance.save()

