from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .exceptions import ValidationError, UsernameTakenError


User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise ValidationError('Username and password are required')
        
        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')
        
        return {'user': user}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'password')

    def validate_username(self, value):
        if not value or len(value) < 3:
            raise ValidationError('Username must be at least 3 characters long')
        
        if User.objects.filter(username=value).exists():
            raise UsernameTakenError()
        
        return value

    def validate_password(self, value):
        if not value or len(value) < 8:
            raise ValidationError('Password must be at least 8 characters long')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user