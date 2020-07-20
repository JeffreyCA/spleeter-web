from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    re_path('.*/', views.index, name='index'),
]
