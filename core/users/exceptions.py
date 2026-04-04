from core.exceptions import APIException
from rest_framework import status


class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'Invalid request'


class UsernameTakenError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_message = 'Username is already taken'