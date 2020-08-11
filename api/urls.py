from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('api/search/', views.YouTubeSearchView.as_view()),
    path('api/source-file/all/', views.SourceFileListView.as_view()),
    path(
        'api/source-file/file/',
        views.SourceFileView.as_view({
            'post': 'create',
            'delete': 'perform_destroy'
        })),
    path('api/source-file/youtube/', views.YTLinkInfoView.as_view()),
    path('api/source-track/', views.SourceTrackListView.as_view()),
    path('api/source-track/<uuid:id>/',
         views.SourceTrackDestroyView.as_view()),
    path('api/source-track/file/', views.FileSourceTrackView.as_view()),
    path('api/source-track/youtube/', views.YTSourceTrackView.as_view()),
    path('api/mix/static/', views.StaticMixCreateView.as_view()),
    path('api/mix/static/<uuid:id>/', views.StaticMixRetrieveView.as_view()),
    path('api/mix/dynamic/', views.DynamicMixCreateView.as_view()),
    path('api/mix/dynamic/<uuid:id>/', views.DynamicMixRetrieveView.as_view()),
    path('api/task/<uuid:id>/',
         views.YTAudioDownloadTaskRetrieveView.as_view())
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
