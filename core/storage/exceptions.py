from core.exceptions import APIException
from rest_framework import status


class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'Invalid request'


class ResourceNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'Resource not found'


class FolderNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'Parent folder not found'


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_message = 'Resource already exists'