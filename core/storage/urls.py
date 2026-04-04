from django.urls import path
from . import views

app_name = 'storage'


urlpatterns = [
    path('', views.ResourceView.as_view(), name='api-resource'),
    path('download/', views.DownloadView.as_view(), name='api-download'),  
    path('move/', views.MoveView.as_view(), name='api-move'),              
    path('search/', views.SearchView.as_view(), name='api-search'),        
]
