from django.shortcuts import render
from django.http import JsonResponse
from django.db.models.deletion import ProtectedError
from rest_framework import generics, viewsets
from .models import Song, SourceFile
from .serializers import SongSerializer, SourceFileSerializer

class SongListCreate(generics.ListCreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

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
