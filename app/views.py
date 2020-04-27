from django.shortcuts import render
from django.http import JsonResponse
from django.db.models.deletion import ProtectedError
from rest_framework import generics, viewsets, mixins, serializers
from .models import *
from .serializers import *
from huey.exceptions import HueyException
from .tasks import *

class SourceFileViewSet(viewsets.ModelViewSet):
    queryset = SourceFile.objects.all()
    serializer_class = SourceFileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source_file = serializer.save()
        (artist, title) = source_file.metadata()
        return JsonResponse({'file_id': source_file.id, 'artist': artist, 'title': title})

    def perform_destroy(self, request):
        file_id = request.data['id']
        try:
            instance = SourceFile.objects.get(id=file_id)
            instance.delete()
            return JsonResponse({'status': 'success'})
        except SourceFile.DoesNotExist:
            return JsonResponse({'status': 'failure', 'error': 'The instance does not exist'})
        except ProtectedError:
            return JsonResponse({'status': 'failure', 'error': 'A Song currently references this file'})

class SourceSongViewSet(generics.ListCreateAPIView):
    queryset = SourceSong.objects.all()
    serializer_class = SourceSongSerializer

class SeparatedSongViewSet(generics.CreateAPIView):
    serializer_class = SeparatedSongSerializer
    queryset = SeparatedSong.objects.all()

    def delete_existing(self, data):
        source = data['source_song']
        vocals = data['vocals']
        drums = data['drums']
        bass = data['bass']
        other = data['other']
        SeparatedSong.objects.filter(source_song=source, vocals=vocals, drums=drums, bass=bass, other=other).exclude(status=SeparatedSong.Status.IN_PROGRESS).delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as e:
            if 'non_field_errors' in serializer.errors and serializer.errors['non_field_errors'][0].code == 'unique':
                overwrite = request.data['overwrite']
                if overwrite:
                    self.delete_existing(request.data)
                    serializer = self.get_serializer(data=request.data)
                    if serializer.is_valid():
                        return super().create(request, *args, **kwargs)
            raise e
    
    def perform_create(self, serializer):
        instance = serializer.save()
        separate_task(instance)

class SeparatedSongRetrieve(generics.RetrieveAPIView):
    serializer_class = SeparatedSongSerializer
    queryset = SeparatedSong.objects.all()
    lookup_field = 'id'
