from django.shortcuts import render

# Create your views here.
from .models import Song
from .serializers import SongSerializer
from rest_framework import generics

class SongListCreate(generics.ListCreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
