from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver
from .models import SourceFile, SourceTrack, ProcessedTrack

@receiver(post_delete, sender=SourceFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    """Post-delete signal to delete temporary uploaded file on disk before deleting instance."""
    if instance.file:
        instance.file.delete()

@receiver(post_delete, sender=SourceTrack, dispatch_uid='delete_source_track_signal')
def delete_source_track(sender, instance, using, **kwargs):
    """Post-delete signal to source track file on disk before deleting instance."""
    if instance.source_file.file:
        instance.source_file.file.delete()

@receiver(pre_delete, sender=ProcessedTrack, dispatch_uid='delete_processed_track_signal')
def delete_processed_track(sender, instance, using, **kwargs):
    """
    Pre-delete signal to processed track file on disk before deleting instance.

    Cannot be post-delete or else submitting a separation task with 'overwrite' flag does
    not work.
    """
    if instance.file:
        instance.file.delete()
