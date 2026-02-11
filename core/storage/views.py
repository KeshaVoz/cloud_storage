from django.shortcuts import render

from django.http import HttpResponse
from django.views import View
from .services import MinIOStorageService


class UploadFileView(View):
    def get(self, request):
        return render(request, 'storage/upload.html')
    
    def post(self, request):
        file_obj = request.FILES['file']
        key = f'uploads/{file_obj.name}'
        storage = MinIOStorageService()
        url = storage.upload_file(file_obj, key)
        return HttpResponse(f'File uploaded: {url}')
