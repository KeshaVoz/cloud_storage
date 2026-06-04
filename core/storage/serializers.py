from rest_framework import serializers
from .exceptions import ValidationError
from typing import Any


class ResourceSerializer(serializers.Serializer):
    name = serializers.CharField()
    path = serializers.CharField()
    size = serializers.IntegerField(required=False, allow_null=True)
    type = serializers.ChoiceField(choices=[('FILE', 'FILE'), ('DIRECTORY', 'DIRECTORY')])
    lastModified = serializers.DateTimeField(required=False, allow_null=True, source='last_modified')

    def to_representation(self, instance: Any) -> dict[str, Any]:
        data = super().to_representation(instance)
        return {
            'name': data.get('name'),
            'path': data.get('path'),
            'size': data.get('size'),
            'type': data.get('type'),
            'lastModified': data.get('lastModified')
        }


class MoveRequestSerializer(serializers.Serializer):
    from_path = serializers.CharField(required=True)
    to_path = serializers.CharField(required=True)

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        if data['from_path'] == data['to_path']:
            raise ValidationError('Source and target paths are identical')
        return data