import io
import zipfile
from .minio_service import get_minio_storage
from ..utils import sanitize_key
from ..exceptions import ValidationError, ResourceNotFoundError, FolderNotFoundError, ConflictError


class SearchService: 
    def __init__(self, user_root, storage):
        self.user_root = user_root
        self.storage = storage

    def exists(self, full_key: str) -> bool:
        return self.storage.search.exists(full_key)
    
    
    def build_info(self, name, size=None, last_modified=None, is_dir=False):
        clean_name = name.rstrip('/')
        
        if '/' in clean_name:
            parts = clean_name.rsplit('/', 1)
            parent_path = parts[0] + '/'  
            resource_name = parts[1]
        else:
            parent_path = ''  
            resource_name = clean_name
        
        if is_dir:
            resource_name += '/'
            return {
                'name': resource_name,
                'path': parent_path,
                'size': None,
                'type': 'DIRECTORY',
                'last_modified': None
            }
        else:
            last_mod = last_modified.isoformat() if hasattr(last_modified, 'isoformat') else last_modified
            return {
                'name': resource_name,
                'path': parent_path,
                'size': size,
                'type': 'FILE',
                'last_modified': last_mod
            }
    
    def list_directory(self, relative_path=''):
        clean_path = sanitize_key(relative_path)
        prefix = f"{self.user_root}{clean_path}/" if clean_path else self.user_root
        
        objects = self.storage.search.list_objects(prefix, recursive=False)
        results = []
        
        for obj in objects:
            if obj['Key'] == prefix:
                continue
            
            is_folder = obj['Key'].endswith('/')
            rel_name = obj['Key'].replace(self.user_root, '', 1)
            
            if is_folder:
                rel_name = rel_name.rstrip('/')
                results.append(self.build_info(rel_name, is_dir=True))
            else:
                size = obj.get('Size')
                last_mod = obj.get('LastModified')
                results.append(self.build_info(rel_name, size=size, last_modified=last_mod, is_dir=False))
        
        return results

    def search(self, query: str):
        if not query or not query.strip():
            raise ValidationError('Search query is empty')
        
        clean_query = sanitize_key(query.strip()).lower()
        prefix = self.user_root
        
        objects = self.storage.search.list_objects(prefix, recursive=True)
        results = []
        
        for obj in objects:
            if obj.get('IsFolder') or obj['Key'].endswith('/'):
                continue
            
            rel_path = obj['Key'].replace(self.user_root, '', 1)
            file_name = rel_path.split('/')[-1].lower()
            
            if clean_query in file_name:
                info = self.build_info(
                    name=rel_path,
                    size=obj.get('Size'),
                    last_modified=obj.get('LastModified'),
                    is_dir=False
                )
                results.append(info)
        
        return results


class UserFileService:   
    def __init__(self, user_root, storage):
        self.user_root = user_root
        self.storage = storage
        self.search = SearchService(self.user_root, self.storage)

    def upload(self, relative_path, file_obj, base_path=''):
        clean_path = sanitize_key(relative_path)
        if not clean_path:
            raise ValidationError('Invalid file path')
        
        if '/' in clean_path:
            full_key = f"{self.user_root}{clean_path}"
            info_path = clean_path
        else:
            parts = [p for p in [base_path.rstrip('/'), clean_path] if p]
            full_path = '/'.join(parts)
            full_key = f"{self.user_root}{full_path}"
            info_path = full_path
        
        file_data = file_obj.read()
        
        if self.search.exists(full_key):
            raise ConflictError('File already exists')
        
        self.storage.files.upload(full_key, file_data, content_type=file_obj.content_type)
        return self.search.build_info(info_path, size=len(file_data), is_dir=False)

    def download(self, relative_path):
        clean_path = sanitize_key(relative_path)
        full_key = f"{self.user_root}{clean_path}"
        return self.storage.files.download(full_key)

    def delete(self, relative_path):
        clean_path = sanitize_key(relative_path)
        full_key = f"{self.user_root}{clean_path}"
        self.storage.files.delete(full_key)

    def move(self, from_rel_path, to_rel_path):
        clean_from = sanitize_key(from_rel_path)
        clean_to = sanitize_key(to_rel_path)
        full_from = f"{self.user_root}{clean_from}"
        full_to = f"{self.user_root}{clean_to}"
        
        if not self.search.exists(full_from):
            raise ResourceNotFoundError('Source file not found')
        
        if self.search.exists(full_to):
            raise ConflictError('Resource already exists at target path')
        
        self.storage.files.copy(full_from, full_to)
        self.storage.files.delete(full_from)
        return self.search.build_info(clean_to, is_dir=False)


class UserFolderService:    
    def __init__(self, user_root, storage):
        self.user_root = user_root
        self.storage = storage
        self.search = SearchService(self.user_root, self.storage)

    def create(self, relative_path):
        clean_path = sanitize_key(relative_path)
        if not clean_path.endswith('/'):
            clean_path += '/'
        
        full_key = f"{self.user_root}{clean_path}"
        
        parent_path = '/'.join(clean_path.rstrip('/').split('/')[:-1])
        if parent_path and not self.search.exists(f"{self.user_root}{parent_path}/"):
            raise FolderNotFoundError()

        if self.search.exists(full_key):
            raise ConflictError('Folder already exists')
        self.storage.folders.create_placeholder(full_key)
        return self.search.build_info(clean_path.rstrip('/'), is_dir=True)

    def delete(self, relative_path):
        clean_path = sanitize_key(relative_path)
        if not clean_path.endswith('/'):
            clean_path += '/'
        full_prefix = f"{self.user_root}{clean_path}"
        self.storage.folders.delete_recursive(full_prefix)

    def move(self, from_rel_path, to_rel_path):
        clean_from = sanitize_key(from_rel_path)
        clean_to = sanitize_key(to_rel_path)
        if not clean_from.endswith('/'):
            clean_from += '/'
        if not clean_to.endswith('/'):
            clean_to += '/'
        
        full_from = f"{self.user_root}{clean_from}"
        full_to = f"{self.user_root}{clean_to}"
        
        if not self.search.exists(full_from):
            objs = self.storage.search.list_objects(full_from, recursive=False)
            if not list(objs):
                raise ResourceNotFoundError('Source folder not found')
        
        if self.search.exists(full_to):
            raise ConflictError('Folder already exists at target path')
        
        objects = self.storage.search.list_objects(full_from, recursive=True)
        for obj in objects:
            if obj.get('IsFolder'):
                continue
            new_key = obj['Key'].replace(full_from, full_to, 1)
            self.storage.files.copy(obj['Key'], new_key)
            self.storage.files.delete(obj['Key'])
        
        self.storage.folders.create_placeholder(full_to)
        if self.search.exists(full_from):
            self.storage.files.delete(full_from)
        
        return self.search.build_info(clean_to.rstrip('/'), is_dir=True)

    def download_as_zip(self, relative_path):
        clean_path = sanitize_key(relative_path)
        if not clean_path.endswith('/'):
            clean_path += '/'
        full_prefix = f"{self.user_root}{clean_path}"
        
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            objects = self.storage.search.list_objects(full_prefix, recursive=True)
            for obj in objects:
                if obj.get('IsFolder') or obj['Key'].endswith('/'):
                    continue
                arcname = obj['Key'].replace(full_prefix, '', 1)
                stream = self.storage.files.download(obj['Key'])
                zip_file.writestr(arcname, stream.read())
        
        buffer.seek(0)
        return buffer


class FileSystemService:    
    def __init__(self, user):        
        self.user = user
        self.storage = get_minio_storage()
        self.user_root = f'user-{user.id}-files/'
        
        self.files = UserFileService(self.user_root, self.storage)
        self.folders = UserFolderService(self.user_root, self.storage)
        self.search = SearchService(self.user_root, self.storage)