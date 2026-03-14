import json
import os
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from .utils import create_breadcrumbs, redirect_back_or_root
from .services import FileSystemService


@login_required
def root(request):
    service = FileSystemService(request.user)
    path = request.GET.get('path', '').strip('/')
    data = service.list_objects_in_current_dir(path)
    breadcrumbs = create_breadcrumbs(path) if path else []
    context = {
        'path': path,
        'breadcrumbs': breadcrumbs,
        'dirs': data.get('dirs', []),
        'files': data.get('files', []),
    }
    return render(request, 'storage/root.html', context)


@login_required
@require_http_methods(['POST'])
def upload_files(request):
    service = FileSystemService(request.user)
    path = request.POST.get('path', '').strip('/')
    files = request.FILES.getlist('file')
    service.upload_files(files, path)
    return redirect_back_or_root(request)


@login_required
@require_http_methods(['POST'])
def upload_folder(request):
    service = FileSystemService(request.user)
    path = request.POST.get('path', '').strip('/')
    folder_json = request.POST.get('folder_json', '{}')
    data = json.loads(folder_json)
    files = request.FILES.getlist('folder')
    service.upload_folder(data, files, path)
    return redirect_back_or_root(request)


@login_required
@require_http_methods(['POST'])
def create_folder(request):
    service = FileSystemService(request.user)
    path = request.POST.get('path', '').strip()
    new_folder_name = request.POST.get('new_folder_name', '').strip()
    service.create_folder(new_folder_name, path)
    return redirect_back_or_root(request)


@login_required
@require_http_methods(['POST'])
def rename_file(request):
    service = FileSystemService(request.user)
    path = request.POST.get('path', '').strip()
    new_name = request.POST.get('new_name', '').strip()
    service.rename_file(new_name, path)
    return redirect_back_or_root(request)


@login_required
@require_http_methods(['POST'])
def delete_file(request):
    service = FileSystemService(request.user)
    path = request.POST.get('path', '').strip()
    service.delete_file(path)
    return redirect_back_or_root(request)
 
 
@login_required
def download_file(request):
    service = FileSystemService(request.user)
    path = request.GET.get('path', '').strip()
    file_content = service.get_file(path)
    response = HttpResponse(file_content, content_type='application/octet-stream')
    filename = os.path.basename(path)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
 

@login_required
def search_files(request):
    service = FileSystemService(request.user)
    query = request.GET.get('query', '').strip()
    all_files = service.list_dir_recursive()
    filter = query.lower()
    filtered = service.filter_files(all_files, filter)
    context = {
        'query': query,
        'results': filtered,
    }
    return render(request, 'storage/search.html', context)


@login_required
def download_folder(request):
    service = FileSystemService(request.user)
    path = request.GET.get('path', '').strip('/')
    zip_buffer = service.get_folder_as_zip(path)
    filename = f'{os.path.basename(path)}.zip'
    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
