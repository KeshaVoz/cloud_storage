import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from django.conf import settings
from ..exceptions import ResourceNotFoundError, ValidationError
from typing import Any
from botocore.response import StreamingBody


logger = logging.getLogger(__name__)


class MinIOFileOperations:  
    def __init__(self, client: Any, bucket_name: str) -> None:
        self.client = client
        self.bucket = bucket_name


    def upload(self, object_name: str, file_data: bytes | Any, content_type: str = 'application/octet-stream') -> None:
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=object_name,
                Body=file_data,
                ContentType=content_type
            )
        except ClientError as e:
            logger.error(f"MinIO upload error for {object_name}: {e}")
            raise ValidationError(f"Upload failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")


    def download(self, object_name: str) -> StreamingBody:
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=object_name)
            return response['Body']
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise ResourceNotFoundError(f"File not found: {object_name}")
            logger.error(f"MinIO download error for {object_name}: {e}")
            raise ValidationError(f"Download failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")


    def delete(self, object_name: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=object_name)
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise ResourceNotFoundError(f"File not found: {object_name}")
            logger.error(f"MinIO delete error for {object_name}: {e}")
            raise ValidationError(f"Delete failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")


    def copy(self, source_name: str, dest_name: str) -> None:
        try:
            copy_source = {'Bucket': self.bucket, 'Key': source_name}
            self.client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket,
                Key=dest_name
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise ResourceNotFoundError(f"Source file not found: {source_name}")
            logger.error(f"MinIO copy error from {source_name} to {dest_name}: {e}")
            raise ValidationError(f"Copy failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")


class MinIOFolderOperations:
    def __init__(self, client: Any, bucket_name: str) -> None:
        self.client = client
        self.bucket = bucket_name

    def create_placeholder(self, folder_name: str) -> None:
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=folder_name,
                Body=b''
            )
        except ClientError as e:
            logger.error(f"MinIO create folder error for {folder_name}: {e}")
            raise ValidationError(f"Create folder failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")

    def delete_recursive(self, prefix: str) -> None:
        try:
            paginator = self.client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(Bucket=self.bucket, Prefix=prefix)
            
            for page in page_iterator:
                if 'Contents' in page:
                    objects_to_delete = [{'Key': obj['Key']} for obj in page['Contents']]
                    if objects_to_delete:
                        self.client.delete_objects(
                            Bucket=self.bucket,
                            Delete={'Objects': objects_to_delete}
                        )
        except ClientError as e:
            logger.error(f"MinIO recursive delete error for {prefix}: {e}")
            raise ValidationError(f"Delete folder failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")


class MinIOSearchOperations:
    def __init__(self, client: Any, bucket_name: str) -> None:
        self.client = client
        self.bucket = bucket_name

    def exists(self, object_name: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=object_name)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            logger.error(f"MinIO exists check error for {object_name}: {e}")
            raise ValidationError(f"Exists check failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")

    def list_objects(self, prefix: str, recursive: bool = False, delimiter: str = '/') -> list[dict[str, Any]]:
        objects = []
        try:
            paginator = self.client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket,
                Prefix=prefix,
                Delimiter=delimiter if not recursive else '',
                PaginationConfig={'PageSize': 1000}
            )
            
            for page in page_iterator:
                if 'Contents' in page:
                    objects.extend(page['Contents'])
                if not recursive and 'CommonPrefixes' in page:
                    for cp in page['CommonPrefixes']:
                        objects.append({'Key': cp['Prefix'], 'Size': 0, 'IsFolder': True})
        except ClientError as e:
            logger.error(f"MinIO list error for prefix {prefix}: {e}")
            raise ValidationError(f"List failed: {e.response['Error']['Message']}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")
        return objects


class MinIOStorageService:
    def __init__(self) -> None:
        self.s3_client = boto3.client(
            's3',
            endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
            aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
            verify=getattr(settings, 'AWS_S3_VERIFY', False),
        )
        self.bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'user-files')
        
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                try:
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                except ClientError as create_err:
                    logger.error(f"Failed to create bucket: {create_err}")
                    raise ValidationError(f"Failed to create bucket: {create_err}")
            else:
                logger.error(f"Failed to access bucket: {e}")
                raise ValidationError(f"Failed to access bucket: {e}")
        except NoCredentialsError:
            raise ValidationError("MinIO credentials not configured")

        self.files = MinIOFileOperations(self.s3_client, self.bucket_name)
        self.folders = MinIOFolderOperations(self.s3_client, self.bucket_name)
        self.search = MinIOSearchOperations(self.s3_client, self.bucket_name)
    

def get_minio_storage() -> MinIOStorageService:
    return MinIOStorageService()