from django.http import JsonResponse
from django.db.models import Q
from django.db.models.deletion import ProtectedError
from django.db.utils import IntegrityError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from rest_framework import generics, viewsets
from rest_framework.views import APIView

from .models import *
from .serializers import *
from .tasks import *

class YTLinkInfoView(APIView):
    """View that handles importing an audio track from a YouTube link."""
    @method_decorator(cache_page(60 * 60 * 2))
    def get(self, request):
        """Parse YouTube link and metadata."""
        serializer = YTLinkSerializer(data=request.query_params)
        if not serializer.is_valid():
            return JsonResponse(
                {
                    'status': 'error',
                    'errors': ['Invalid YouTube link']
                },
                status=400)

        data = serializer.validated_data
        info = get_meta_info(data['link'])
        url = info['url']

        try:
            # Check if a track with given link already exists
            dupe = SourceFile.objects.get(youtube_link=url)
            return JsonResponse({
                'status': 'duplicate',
                'id': dupe.id
            }, status=400)
        except:
            pass

        artist = ''
        title = ''

        # Parse artist and title info
        if info['embedded_artist'] and info['embedded_title']:
            # Embedded meta info takes precedence
            artist = info['embedded_artist']
            title = info['embedded_title']
        elif info['parsed_artist'] and info['parsed_title']:
            # Followed by parsing the artist and title from the video title
            artist = info['parsed_artist']
            title = info['parsed_title']
        else:
            # Followed by uploader name and video title
            artist = info['uploader']
            title = info['title']

        # Return success response with parsed artist and title
        # Note that these are suggested values. The user has ability to set own artist and title.
        return JsonResponse({
            'status': 'success',
            'artist': artist,
            'title': title,
            'url': url
        })

class SourceFileListView(generics.ListAPIView):
    """View that returns list of all SourceFiles."""
    queryset = SourceFile.objects.all()
    serializer_class = SourceFileSerializer

class SourceFileView(viewsets.ModelViewSet):
    """View that handles SourceFile creation and deletion."""
    queryset = SourceFile.objects.all()
    serializer_class = SourceFileSerializer

    def create(self, request, *args, **kwargs):
        """Handle request to create a SourceFile (i.e. user uploads a new audio file.)"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            errors = list(map(str, serializer.errors['file']))
            return JsonResponse({
                'status': 'error',
                'errors': errors
            }, status=400)

        source_file = serializer.save()
        # Create response containing SourceFile ID and suggested artist/title metadata
        (artist, title) = source_file.metadata()
        return JsonResponse({
            'file_id': source_file.id,
            'artist': artist,
            'title': title
        })

    def perform_destroy(self, request):
        """Handle request to delete a SourceFile (i.e. user cancels upload operation)"""
        file_id = request.data['id']
        try:
            instance = SourceFile.objects.get(id=file_id)
            instance.delete()
            return JsonResponse({'status': 'success'})
        except SourceFile.DoesNotExist:
            return JsonResponse(
                {
                    'status': 'error',
                    'error': 'The instance does not exist'
                },
                status=400)
        except ProtectedError:
            return JsonResponse(
                {
                    'status': 'error',
                    'error': 'A Song currently references this file'
                },
                status=400)

class SourceTrackDestroyView(generics.DestroyAPIView):
    """View that handles SourceTrack deletion."""
    queryset = SourceTrack.objects.all()
    serializer_class = SourceTrackSerializer
    lookup_field = 'id'

    def delete(self, request, *args, **kwargs):
        """Handle request to delete SourceTrack."""
        instance_id = kwargs['id']

        # Check if there are separation tasks currently enqueued or in progress
        has_in_progress_tasks = StaticMix.objects.filter(
            Q(source_track=instance_id)
            & (Q(status=TaskStatus.IN_PROGRESS)
               | Q(status=TaskStatus.QUEUED))).exists()

        has_in_progress_tasks = has_in_progress_tasks or DynamicMix.objects.filter(
            Q(source_track=instance_id)
            & (Q(status=TaskStatus.IN_PROGRESS)
               | Q(status=TaskStatus.QUEUED))).exists()

        if has_in_progress_tasks:
            # Prevent deletion if above is true
            return JsonResponse(
                {
                    'status':
                    'error',
                    'error':
                    'Cannot delete track because it has separation tasks enqueued or in progress.'
                },
                status=400)

        # Otherwise, proceed with deleting StaticMixs first
        static_mixes = StaticMix.objects.filter(source_track=instance_id)
        for track in static_mixes:
            track.delete()

        dynamic_mixes = DynamicMix.objects.filter(source_track=instance_id)
        for track in dynamic_mixes:
            track.delete()

        # Lastly, delete the SourceTrack (along with SourceFile)
        # This triggers some of the signals defined in signals.py
        return super().destroy(request, *args, **kwargs)

class SourceTrackListView(generics.ListAPIView):
    """View that handles listing SourceTracks."""
    queryset = SourceTrack.objects.all()
    serializer_class = SourceTrackSerializer

class FileSourceTrackView(generics.CreateAPIView):
    """View that handles SourceTrack creation from user-uploaded file."""
    serializer_class = SourceTrackSerializer

class YTSourceTrackView(generics.CreateAPIView):
    """View that handles SourceTrack creation from user-imported YouTube link."""
    queryset = SourceTrack.objects.all()
    serializer_class = YTSourceTrackSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # Verify data
        if not serializer.is_valid():
            errors = list(map(str, list(serializer.errors.values())))
            return JsonResponse({
                'status': 'error',
                'errors': errors
            }, status=400)

        data = serializer.validated_data
        if 'youtube_link' not in data:
            return JsonResponse(
                {
                    'status': 'error',
                    'errors': ['Missing YouTube link']
                },
                status=400)

        # Create download task and source file models
        fetch_task = YTAudioDownloadTask()
        fetch_task.save()
        source_file = SourceFile(id=fetch_task.id,
                                 is_youtube=True,
                                 youtube_link=data['youtube_link'],
                                 youtube_fetch_task=fetch_task)

        try:
            # Try to save model
            source_file.save()
        except IntegrityError:
            # Failure to save SourceFile model means that it violated integrity constraints
            fetch_task.delete()
            return JsonResponse(
                {
                    'status':
                    'error',
                    'errors': [
                        'A source file with provided YouTube link already exists'
                    ]
                },
                status=400)

        source_track = serializer.save(source_file=source_file)

        try:
            # Kick off download task in background
            fetch_youtube_audio(source_file, data['artist'], data['title'],
                                data['youtube_link'])
        except:
            # YouTube library is flaky, so Huey will retry up to 2 additional times
            pass

        return JsonResponse({
            'song_id': source_track.id,
            'youtube_link': source_track.youtube_link(),
            'fetch_task': source_track.youtube_fetch_task()
        })

class DynamicMixCreateView(generics.ListCreateAPIView):
    """View that handles creating a DynamicMix instance."""
    serializer_class = DynamicMixSerializer
    queryset = DynamicMix.objects.all()

    def delete_existing(self, data):
        """
        Delete any existing DynamicMix objects. Called when user separates a
        track with 'overwrite' flag.
        """
        source = data['source_track']
        DynamicMix.objects.filter(source_track=source).exclude(
            status=TaskStatus.IN_PROGRESS).delete()

    def create(self, request, *args, **kwargs):
        """Handle DynamicMix creation."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return super().create(request, *args, **kwargs)

        print(serializer.errors)
        if request.data['overwrite']:
            self.delete_existing(request.data)
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                return super().create(request, *args, **kwargs)
        return JsonResponse({
            'status': 'error',
            'errors': ['Unknown error']
        }, status=400)

    def perform_create(self, serializer):
        instance = serializer.save()
        # Kick off task in background
        create_dynamic_mix(instance)

class DynamicMixRetrieveView(generics.RetrieveAPIView):
    """View for handling DynamicMix lookup by ID."""
    serializer_class = DynamicMixSerializer
    queryset = DynamicMix.objects.all()
    lookup_field = 'id'

class StaticMixCreateView(generics.ListCreateAPIView):
    """View that handles creating StaticMix"""
    serializer_class = StaticMixSerializer
    queryset = StaticMix.objects.all()

    def delete_existing(self, data):
        """
        Delete any existing StaticMix objects with the same separation parameters as
        the ones given in 'data'. Called when user separates a track with 'overwrite' flag.
        """
        source = data['source_track']
        vocals = data['vocals']
        drums = data['drums']
        bass = data['bass']
        other = data['other']

        StaticMix.objects.filter(
            source_track=source,
            vocals=vocals,
            drums=drums,
            bass=bass,
            other=other).exclude(status=TaskStatus.IN_PROGRESS).delete()

    def create(self, request, *args, **kwargs):
        """Handle StaticMix creation."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return super().create(request, *args, **kwargs)

        if 'non_field_errors' in serializer.errors:
            # Check if there already exists a static mix with same requested parts
            # If that is the case, and the user did not check 'overwrite' option, then return error
            errors = list(map(str, serializer.errors['non_field_errors']))
            if len(errors) == 1 and 'unique set' in errors[0]:
                if request.data['overwrite']:
                    self.delete_existing(request.data)
                    serializer = self.get_serializer(data=request.data)
                    if serializer.is_valid():
                        return super().create(request, *args, **kwargs)
                return JsonResponse(
                    {
                        'status':
                        'error',
                        'errors': [
                            'A static mix already exists with these parts, or task is still in progress.'
                        ]
                    },
                    status=400)
        elif 'checked' in serializer.errors:
            # Ensure user leaves at least one part unchecked and one part checked
            # This is also validated on frontend
            return JsonResponse(
                {
                    'status': 'error',
                    'errors': [serializer.errors['checked']]
                },
                status=400)
        return JsonResponse({
            'status': 'error',
            'errors': ['Unknown error']
        }, status=400)

    def perform_create(self, serializer):
        instance = serializer.save()
        # Kick off separation task in background
        create_static_mix(instance)

class StaticMixRetrieveView(generics.RetrieveAPIView):
    """View for handling StaticMix lookup by ID."""
    serializer_class = StaticMixSerializer
    queryset = StaticMix.objects.all()
    lookup_field = 'id'

class YTAudioDownloadTaskRetrieveView(generics.RetrieveAPIView):
    """View for handling YTAudioDownloadTask lookup by ID."""
    serializer_class = YTAudioDownloadTaskSerializer
    queryset = YTAudioDownloadTask.objects.all()
    lookup_field = 'id'
