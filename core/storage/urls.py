from django.urls import path
from . import views

app_name = 'storage'

urlpatterns = [
<<<<<<< Updated upstream
    path('upload/', views.UploadFileView.as_view(), name='upload'),
]
=======
    path('', views.root, name='root'),
    path('upload_files/', views.upload_files, name='upload_files'),
    path('upload_folder/', views.upload_folder, name='upload_folder'),
    path('create_folder/', views.create_folder, name='create_folder'),
    path('rename_file/', views.rename_file, name='rename_file'),
    path('delete_file/', views.delete_file, name='delete_file'),
    path('download/', views.download_file, name='download_file'),
    path('download_folder/', views.download_folder, name='download_folder'),
    path('search/', views.search_files, name='search'),
]
>>>>>>> Stashed changes
