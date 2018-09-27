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
    def validate_job(self, job):
        if not self.context['request'].user.owns_business(job.location.business):
            raise PermissionDenied()
        return job

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
            'created',
            'updated',
        )
        read_only_fields = ('profile_thumb', 'created', 'updated')
