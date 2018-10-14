from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from hr.models import Job, Employee


class JobSerializer(serializers.ModelSerializer):
    def validate_location(self, location):
        if not self.context['request'].user.owns_business(location.business):
            raise PermissionDenied()
        return location

    class Meta(object):
        model = Job
        fields = (
            'id',
            'location',
            'title',
            'description',
            'created',
            'updated',
        )
        read_only_fields = ('created', 'updated')


class EmployeeSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', allow_null=True)

    def validate_job(self, job):
        if not self.context['request'].user.owns_business(job.location.business):
            raise PermissionDenied()
        return job

    def create(self, validated_data):
        self._set_user(validated_data)
        return super(EmployeeSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        self._set_user(validated_data)
        return super(EmployeeSerializer, self).update(instance, validated_data)

    def _set_user(self, validated_data):
        email = validated_data.pop('user', {}).get('email', None)
        if email is None:
            validated_data['user'] = None
        else:
            validated_data['user'], _ = get_user_model().objects.get_or_create(
                email=email,
            )

    class Meta(object):
        model = Employee
        fields = (
            'id',
            'job',
            'first_name',
            'last_name',
            'telephone',
            'sex',
            'nationality',
            'birthday',
            'national_insurance_number',
            'profile_image',
            'profile_thumb',
            'email',
            'created',
            'updated',
        )
        read_only_fields = ('profile_thumb', 'created', 'updated')
