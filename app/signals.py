from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import SourceFile

@receiver(pre_delete, sender=SourceFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    # Delete file on disk before deleting instance
    instance.file.delete()
