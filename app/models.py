import os

from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

# Create your models here.
class TempFile(models.Model):
    file = models.FileField(upload_to='tmp/')
    def __str__(self):
        return os.path.basename(self.file.name)

@receiver(pre_delete, sender=TempFile, dispatch_uid='delete_temp_file_signal')
def delete_temp_file(sender, instance, using, **kwargs):
    instance.file.delete()

class Song(models.Model):
    file = models.OneToOneField(TempFile, on_delete=models.PROTECT)
    artist = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    def __str__(self):
        return self.artist + ' - ' + self.title
