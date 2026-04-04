from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from django.http import FileResponse
from .serializers import ResourceSerializer, MoveRequestSerializer
from .services.filesystem_service import FileSystemService
from .exceptions import ValidationError


class DirectoryView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        path = request.query_params.get('path', '')
        
        fs = FileSystemService(request.user)
        data = fs.search.list_directory(path)
        
        return Response(ResourceSerializer(data, many=True).data)

    def post(self, request):
        path = request.query_params.get('path')
        if not path:
            raise ValidationError('path is required')
        
        fs = FileSystemService(request.user)
        data = fs.folders.create(path)
        
        return Response(ResourceSerializer(data).data, status=status.HTTP_201_CREATED)


class ResourceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        path = request.query_params.get('path')
        if not path:
            raise ValidationError('path is required')
        
        fs = FileSystemService(request.user)
        is_dir = path.endswith('/')
        info = fs.search.build_info(path, is_dir)
        
        return Response(ResourceSerializer(info).data)

    def delete(self, request):
        path = request.query_params.get('path')
        if not path:
            raise ValidationError('path is required')
        
        fs = FileSystemService(request.user)
        is_dir = path.endswith('/')
        
        if is_dir:
            fs.folders.delete(path)
        else:
            fs.files.delete(path)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        files = request.FILES.getlist('object')
        base_path = request.data.get('path', '')
        
        if not files:
            raise ValidationError('No files provided')
        
        fs = FileSystemService(request.user)
        uploaded = []
        
        for f in files:
            data = fs.files.upload(
                relative_path=f.name,
                file_obj=f,
                base_path=base_path
            )
            uploaded.append(data)
        
        return Response(
            ResourceSerializer(uploaded, many=True).data,
            status=status.HTTP_201_CREATED
        )


class DownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        path = request.query_params.get('path')
        if not path:
            raise ValidationError('path is required')
        
        fs = FileSystemService(request.user)
        
        if path.endswith('/'):
            zip_buffer = fs.folders.download_as_zip(path)
            response = FileResponse(zip_buffer, as_attachment=True, filename='folder.zip')
            response['Content-Type'] = 'application/octet-stream'
            return response
        else:
            stream = fs.files.download(path)
            filename = path.split('/')[-1]
            response = FileResponse(stream, as_attachment=True, filename=filename)
            response['Content-Type'] = 'application/octet-stream'
            return response


class MoveView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from_path = request.query_params.get('from')
        to_path = request.query_params.get('to')
        
        serializer = MoveRequestSerializer(data={'from_path': from_path, 'to_path': to_path})
        serializer.is_valid(raise_exception=True)  
        
        from_path = serializer.validated_data['from_path']
        to_path = serializer.validated_data['to_path']
        
        fs = FileSystemService(request.user)
        is_dir = from_path.endswith('/')
        
        if is_dir:
            data = fs.folders.move(from_path, to_path)
        else:
            data = fs.files.move(from_path, to_path)
        
        return Response(ResourceSerializer(data).data)


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query')
        if not query or not query.strip():
            raise ValidationError('Search query is required')
        
        fs = FileSystemService(request.user)
        results = fs.search.search(query)
        
        return Response(ResourceSerializer(results, many=True).data)