from django.contrib import admin
from .models import Song, SourceFile

# Register your models here.
admin.site.register(Song)
admin.site.register(SourceFile)
