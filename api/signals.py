import os
import shutil

from django.conf import settings
from django.db.models.signals import post_delete, pre_delete
from django.dispatch import receiver

from .models import DynamicMix, SourceFile, SourceTrack, StaticMix

"""
This module defines pre- and post-delete signals to ensure files are deleted when a model is deleted from the DB.
"""

@receiver(pre_delete,
          sender=SourceFile,
          dispatch_uid='delete_source_file_signal')
def delete_source_file(sender, instance, using, **kwargs):
    """Pre-delete signal to delete source file on disk before deleting instance."""
    if instance.file:
        instance.file.delete()

    # Delete directory
    if str(instance.id):
        directory = os.path.join(settings.MEDIA_ROOT, settings.UPLOAD_DIR,
                                 str(instance.id))
        shutil.rmtree(directory, ignore_errors=True)
        print('Removed directory: ', directory)

    if instance.youtube_fetch_task:
        instance.youtube_fetch_task.delete()

@receiver(post_delete,
          sender=SourceTrack,
          dispatch_uid='delete_source_track_signal')
def delete_source_track(sender, instance, using, **kwargs):
    """Post-delete signal to source track file on disk before deleting instance."""
    if instance.source_file:
        # This will call delete_source_file above
        instance.source_file.delete()

@receiver(pre_delete,
          sender=StaticMix,
          dispatch_uid='delete_static_mix_signal')
def delete_static_mix(sender, instance, using, **kwargs):
    """
    Pre-delete signal to static mix file on disk before deleting instance.

    Cannot be post-delete or else submitting a separation task with 'overwrite' flag does
    not work.
    """
    if instance.file:
        instance.file.delete()

    # Delete directory
    if str(instance.id):
        directory = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR,
                                 str(instance.id))
        shutil.rmtree(directory, ignore_errors=True)
        print('Removed directory: ', directory)

@receiver(pre_delete,
          sender=DynamicMix,
          dispatch_uid='delete_dynamic_mix_signal')
def delete_dynamic_mix(sender, instance, using, **kwargs):
    if instance.vocals_file:
        instance.vocals_file.delete()
    if instance.other_file:
        instance.other_file.delete()
    if instance.piano_file:
        instance.piano_file.delete()
    if instance.bass_file:
        instance.bass_file.delete()
    if instance.drums_file:
        instance.drums_file.delete()

    # Delete directory
    if str(instance.id):
        directory = os.path.join(settings.MEDIA_ROOT, settings.SEPARATE_DIR,
                                str(instance.id))
        shutil.rmtree(directory, ignore_errors=True)
        print('Removed directory: ', directory)
