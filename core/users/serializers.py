from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from typing import Any
from django.contrib.auth.models import User as UserType


User = get_user_model()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError("Username and password are required")
        
        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        return {'user': user}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(
        min_length=3,
        validators=[serializers.validators.UniqueValidator(queryset=User.objects.all(), message="Username is already taken")]
    )

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data: dict[str, Any]) -> UserType:
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )