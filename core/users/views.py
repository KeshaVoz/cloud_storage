from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout
from .serializers import LoginSerializer, RegisterSerializer


class LoginAPIView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)  
        
        return Response({
            'username': user.username,
        }, status=status.HTTP_200_OK)


class RegisterAPIView(GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        login(request, user) 
        
        return Response({
            'username': user.username,
        }, status=status.HTTP_201_CREATED)


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
        })