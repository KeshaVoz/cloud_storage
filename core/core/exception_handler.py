from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context) -> Response | None:
    response = drf_exception_handler(exc, context)
    
    if response is not None:
        if isinstance(response.data, dict) and 'detail' in response.data:
            response.data = {
                'message': response.data['detail'],
                'errors': None
            }
        else:
            response.data = {
                'message': 'Validation error',
                'errors': response.data  
            }
        return response
    
    logger.error(f'Unhandled exception: {type(exc).__name__}: {exc}', exc_info=True)
    return Response({
        'message': 'Internal server error',
        'errors': None
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)