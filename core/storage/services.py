import io
import os
import zipfile
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
import logging
from .utils import sanitize_key


logger = logging.getLogger(__name__)


class MinIOStorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
            aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
            verify=getattr(settings, 'AWS_S3_VERIFY', False),
        )
        self.bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'user-files')

    def list_objects_in_current_dir(self, prefix):
        dirs = set()
        files = []
        try:
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=prefix,
                Delimiter='/'
            )

            for page in pages:
                if 'CommonPrefixes' in page:
                    for common_prefix in page['CommonPrefixes']:
                        full_dir = common_prefix['Prefix']
                        rel_dir = full_dir[len(prefix.rstrip('/')):].rstrip('/')
                        if rel_dir:
                            dirs.add(rel_dir)

                if 'Contents' in page:
                    for obj in page['Contents']:
                        key = obj['Key']
                        if key.endswith('/') or not key.startswith(prefix):
                            continue
                        rel_path = key[len(prefix.rstrip('/')):]
                        files.append(rel_path)

            return {
                'dirs': sorted(list(dirs)),
                'files': sorted(files)
            }
        except Exception as e:
            logger.error(f'List error: {e}')
            return {'dirs': [], 'files': []}    

    def upload_file(self, file_obj, full_key):
        if self._exists(full_key):
            full_key = self._generate_unique_name(full_key)
        try:
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                full_key,
                ExtraArgs={'ContentType': getattr(file_obj, 'content_type', 'application/octet-stream')}
            )
            return True
        except Exception as e:
            logger.error(f'Upload error: {e}')
            return False
    
    def create_folder(self, full_key):
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=full_key,
                Body=b''
            )
            return True
        except Exception as e:
            logger.error(f'Create dir error: {e}')
            return False

    def get_file(self, full_key):
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=full_key)
            return response['Body'].read()
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise ValueError('File not found')
            raise ValueError(f'Fail to get file: {e}')

    def delete_file(self, full_key):
        try:
            if full_key.endswith('/'):
                self._delete_dir_contents(full_key)
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=full_key)
                return True
            else:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=full_key)
                return True
        except ClientError as e:
            logger.error(f'Delete error: {e}')
            return False

    def rename_file(self, old_full_key, new_full_key):
        try:
            old_obj = self.s3_client.get_object(Bucket=self.bucket_name, Key=old_full_key)
            if self._exists(new_full_key):
                new_full_key = self._generate_unique_name(new_full_key)
            self.s3_client.upload_fileobj(
                old_obj['Body'],
                self.bucket_name,
                new_full_key
            )
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=old_full_key)
            return True
        except Exception as e:
            logger.error(f'Rename error: {e}')
            return False

    def rename_folder(self, old_prefix, new_prefix):
        paginator = self.s3_client.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=self.bucket_name, Prefix=old_prefix):
            for obj in page.get('Contents', []):
                old_key = obj['Key']
                new_key = new_prefix + old_key[len(old_prefix):]
                try:
                    self.s3_client.copy_object(
                        Bucket=self.bucket_name,
                        CopySource={'Bucket': self.bucket_name, 'Key': old_key},
                        Key=new_key,
                    )
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=old_key)
                except Exception as e:
                    logger.error(f'Failed to rename {old_key}: {e}')
                    return False
        return True

    def list_dir_recursive(self, prefix):
        results = []
        paginator = self.s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(
            Bucket=self.bucket_name,
            Prefix=prefix,
        )

        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    key = obj['Key']
                    if key.endswith('/'):
                        continue  
                    rel_path = key[len(prefix):] 
                    results.append({
                        'path': rel_path,
                        'full_key': key,
                    })

        return results

    def _delete_dir_contents(self, prefix):
        try:
            if not prefix.endswith('/'):
                prefix += '/'

            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
            objects_to_delete = []
            for page in pages:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        objects_to_delete.append({'Key': obj['Key']})

            if objects_to_delete:
                self.s3_client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
            return True
        except Exception:
            return False
    
    def _generate_unique_name(self, full_key):
        dir_path, filename = os.path.split(full_key)
        name, ext = os.path.splitext(filename)
    
        counter = 1
        while True:
            test_key = f'{dir_path}/{name}({counter}){ext}'
            if not self._exists(test_key):
                return test_key
            counter += 1
    
    def _exists(self, key):
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except:
            return False


class FileSystemService:
    def __init__(self, user):
        self.user = user
        self.storage = MinIOStorageService()
        self.user_root = f'user-{user.id}-files/' 

    def list_objects_in_current_dir(self, relative_path=''):
        prefix = self._build_prefix(relative_path)
        return self.storage.list_objects_in_current_dir(prefix)

    def upload_files(self, file_list, path):
        for file_obj in file_list:
            filename = file_obj.name
            relative_path = f'{path}/{filename}' if path else filename
            full_key = self._build_key(relative_path)
            self.storage.upload_file(file_obj, full_key)

    def upload_folder(self, data_json, file_list, path):
        file_map = {}
        for file_obj in file_list:
            file_map[file_obj.name] = file_obj

        for item in data_json['files']:
            name = item['name']
            inner_path = item['path']
            file_obj = file_map.get(name)
            relative_path = f'{path}/{inner_path}' if path else inner_path
            full_key = self._build_key(relative_path)
            self.storage.upload_file(file_obj, full_key)

    def create_folder(self, new_folder_name, path):
        folder_path = f'{path}/{new_folder_name}'.strip('/') if path else new_folder_name
        full_key = self._build_key(folder_path, is_dir=True)
        self.storage.create_folder(full_key)

    def rename_file(self, new_name, relative_path):
        is_dir = relative_path.rstrip().endswith('/')
        new_relative_path = self._build_path_with_new_name(relative_path, new_name, is_dir)
        old_key = self._build_key(relative_path, is_dir=is_dir)
        new_key = self._build_key(new_relative_path, is_dir=is_dir)
        if is_dir:
            return self.storage.rename_folder(old_key, new_key)  
        self.storage.rename_file(old_key, new_key)

    def delete_file(self, relative_path):
        is_dir = relative_path.rstrip().endswith('/')
        full_key = self._build_key(relative_path, is_dir=is_dir)
        self.storage.delete_file(full_key)

    def list_all_objects(self):
        prefix = self.user_root
        return self.storage.list_dir_recursive(self, prefix)
    
    def get_file(self, relative_path):
        full_key = self._build_key(relative_path)
        return self.storage.get_file(full_key)
    
    def list_dir_recursive(self, relative_path=''):
        prefix = self._build_prefix(relative_path)
        return self.storage.list_dir_recursive(prefix)
    
    def get_folder_as_zip(self, relative_path):
        files = self.list_dir_recursive(relative_path)
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for file_info in files:
                full_key = file_info['full_key']
                content = self.storage.get_file(full_key)
                arcname = file_info['path']
                zf.writestr(arcname, content)

        zip_buffer.seek(0)
        return zip_buffer
    
    def filter_files(self, file_list, filter):
        filtered = []
        for file in file_list:
            path = file['path']
            filename = path.split('/')[-1]
            if filter in filename.lower():
                filtered.append({
                    'path': path,
                    'parent_path': path.rsplit('/', 1)[0] if '/' in path else '',
                })

        return filtered
    
    def _build_key(self, relative_path, is_dir=False):
        clean = sanitize_key(relative_path)
        key = f'{self.user_root}{clean}'
        if is_dir and not key.endswith('/'):
            key += '/'
        return key

    def _build_prefix(self, relative_path):
        clean = sanitize_key(relative_path)
        return f'{self.user_root}{clean}/' if clean else self.user_root
    
    def _build_path_with_new_name(self, relative_path, new_name, is_dir=False):
        base = relative_path.rsplit('/', 1)[0] if not is_dir else relative_path.rsplit('/', 2)[0]
        new_relative_path = f'{base}/{new_name}'
        return new_relative_path