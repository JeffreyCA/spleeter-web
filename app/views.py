from django.http import JsonResponse
from django.db.models.deletion import ProtectedError
from django.db.utils import IntegrityError
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from huey.exceptions import HueyException

from rest_framework import generics, viewsets, mixins, serializers
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError, ParseError
from rest_framework.views import APIView

from .models import *
from .serializers import *
from .tasks import *

class YouTubeLinkInfoView(APIView):
    @method_decorator(cache_page(60*60*2))
    def get(self, request):
        serializer = YouTubeLinkSerializer(data=request.query_params)
        if not serializer.is_valid():
            return JsonResponse({'status': 'error', 'errors': ['Invalid YouTube link']}, status=400)

        data = serializer.validated_data
        info = get_meta_info(data['link'])
        url = info['url']

        try:
            dupe = SourceFile.objects.get(youtube_link=url)
            return JsonResponse({'status': 'duplicate', 'id': dupe.id}, status=400)
        except:
            pass

        artist = ''
        title = ''

        if info['embedded_artist'] and info['embedded_title']:
            artist = info['embedded_artist']
            title = info['embedded_title']
        elif info['parsed_artist'] and info['parsed_title']:
            artist = info['parsed_artist']
            title = info['parsed_title']
        else:
            artist = info['uploader']
            title = info['title']

        return JsonResponse({'status': 'success', 'artist': artist, 'title': title, 'url': url})

class SourceFileList(generics.ListAPIView):
    queryset = SourceFile.objects.all()
    serializer_class = SourceFileSerializer

class SourceFileViewSet(viewsets.ModelViewSet):
    queryset = SourceFile.objects.all()
    serializer_class = SourceFileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            errors = list(map(str, serializer.errors['file']))
            return JsonResponse({'status': 'error', 'errors': errors}, status=400)
        
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
            return JsonResponse({'status': 'error', 'error': 'The instance does not exist'}, status=400)
        except ProtectedError:
            return JsonResponse({'status': 'error', 'error': 'A Song currently references this file'}, status=400)

class SourceSongViewSet(generics.ListCreateAPIView):
    queryset = SourceSong.objects.all()
    serializer_class = SourceSongSerializer

class SourceSongYouTubeViewSet(generics.CreateAPIView):
    queryset = SourceSong.objects.all()
    serializer_class = SourceSongYouTubeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            errors = list(map(str, list(serializer.errors.values())))
            return JsonResponse({'status': 'error', 'errors': errors}, status=400)

        data = serializer.validated_data
        if 'youtube_link' not in data:
            return JsonResponse({'status': 'error', 'errors': ['Missing YouTube link']}, status=400)

        fetch_task = YouTubeFetchTask()
        fetch_task.save()
        source_file = SourceFile(id=fetch_task.id, is_youtube=True, youtube_link=data['youtube_link'], youtube_fetch_task=fetch_task)
        try:
            source_file.save()
        except IntegrityError:
            fetch_task.delete()
            return JsonResponse({'status': 'error', 'errors': ['A source file with provided YouTube link already exists']}, status=400)

        source_song = serializer.save(source_id=source_file)
        fetch_youtube_audio(source_file, data['artist'], data['title'], data['youtube_link'])

        return JsonResponse({'song_id': source_song.id, 'youtube_link': source_song.youtube_link(), 'fetch_task': source_song.youtube_fetch_task()})

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
        if serializer.is_valid():
            return super().create(request, *args, **kwargs)

        if 'non_field_errors' in serializer.errors:
            errors = list(map(str, serializer.errors['non_field_errors']))
            if len(errors) == 1 and 'unique set' in errors[0]:
                if request.data['overwrite']:
                    self.delete_existing(request.data)
                    serializer = self.get_serializer(data=request.data)
                    if serializer.is_valid():
                        return super().create(request, *args, **kwargs)
                return JsonResponse({'status': 'error', 'errors': ['A separated song already exists with these parts.']}, status=400)
        return JsonResponse({'status': 'error', 'errors': ['Unknown error']}, status=400)

    def perform_create(self, serializer):
        instance = serializer.save()
        separate_task(instance)

class SeparatedSongRetrieve(generics.RetrieveAPIView):
    serializer_class = SeparatedSongSerializer
    queryset = SeparatedSong.objects.all()
    lookup_field = 'id'

class FetchTaskRetrieve(generics.RetrieveAPIView):
    serializer_class = FetchTaskSerializer
    queryset = YouTubeFetchTask.objects.all()
    lookup_field = 'id'
