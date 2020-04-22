from django.shortcuts import render
from django.http import JsonResponse
from django.db.models.deletion import ProtectedError
# Create your views here.
from .models import Song, TempFile
from .serializers import SongSerializer, TempFileSerializer
from rest_framework import generics, viewsets

class SongListCreate(generics.ListCreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class TempFileViewSet(viewsets.ModelViewSet):
    queryset = TempFile.objects.all()
    serializer_class = TempFileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tempfile = serializer.save()
        return JsonResponse({'file_id': tempfile.id, 'url': tempfile.file.url})

    def perform_destroy(self, request):
        file_id = request.data['id']
        try:
            instance = TempFile.objects.get(id=file_id)
            instance.delete()
            return JsonResponse({'status': 'success'})
        except TempFile.DoesNotExist:
            return JsonResponse({'status': 'failure', 'error': 'The instance does not exist'})
        except ProtectedError:
            return JsonResponse({'status': 'failure', 'error': 'A Song currently references this file'})

