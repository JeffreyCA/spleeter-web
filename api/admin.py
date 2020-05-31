from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(SourceFile)
admin.site.register(SourceTrack)
admin.site.register(ProcessedTrack)
admin.site.register(YTAudioDownloadTask)
