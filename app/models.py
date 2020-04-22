from django.db import models

# Create your models here.
class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    length = models.DurationField()
    file = models.FileField(upload_to='uploads/')

class TempFile(models.Model):
    file = models.FileField(upload_to='tmp/')
