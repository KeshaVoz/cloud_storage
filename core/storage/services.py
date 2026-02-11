import boto3
from botocore.exceptions import ClientError
from django.conf import settings


class MinIOStorageService:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            use_ssl=settings.AWS_S3_USE_SSL,
            verify=settings.AWS_S3_VERIFY,
        )
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME
        print('Bucket name:', self.bucket)

    def upload_file(self, file_obj, key: str) -> str:
        try:
            self.s3.upload_fileobj(file_obj, self.bucket, key)
            return f'{settings.AWS_S3_ENDPOINT_URL}/{self.bucket}/{key}'
        except ClientError as e:
            raise RuntimeError(f'Failed to upload file: {e}')

    def download_file(self, key: str, file_obj):
        try:
            self.s3.download_fileobj(self.bucket, key, file_obj)
        except ClientError as e:
            raise RuntimeError(f'Failed to download file: {e}')

    def delete_file(self, key: str):
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=key)
        except ClientError as e:
            raise RuntimeError(f'Failed to delete file: {e}')

    def file_exists(self, key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False