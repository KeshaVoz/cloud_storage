from rest_framework import status


class APIException(Exception):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_message = 'Internal server error'

    def __init__(self, message=None):
        self.message = message or self.default_message
        super().__init__(self.message)