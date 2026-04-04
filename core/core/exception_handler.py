from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
import logging
from .exceptions import APIException


logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    
    if response is not None:
        if isinstance(response.data, dict) and 'detail' in response.data:
            response.data = {'message': response.data['detail']}
        elif isinstance(response.data, list):
            response.data = {'message': '; '.join(str(err) for err in response.data)}
        return response
    
    if isinstance(exc, APIException):
        return Response(
            {'message': exc.message},
            status=exc.status_code
        )
    
    if isinstance(exc, AuthenticationFailed):
        return Response(
            {'message': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if isinstance(exc, PermissionDenied):
        return Response(
            {'message': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logger.error(f'Unhandled exception: {type(exc).__name__}: {exc}', exc_info=True)
    
    return Response(
        {'message': 'Internal server error'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )