"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('api/upload/', views.SourceFileViewSet.as_view({'post': 'create', 'delete': 'perform_destroy'})),
    path('api/song/', views.SourceSongViewSet.as_view()),
    path('api/process/', views.SeparatedSongViewSet.as_view()),
    path('api/test', views.test)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
