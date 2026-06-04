from rest_framework.exceptions import APIException as DRFAPIException
from rest_framework import status

class APIException(DRFAPIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Internal server error'
    
    def __init__(self, message=None) -> None:
        self.detail = message or self.default_detail
        self.message = self.detail 
        super().__init__(detail=self.detail)