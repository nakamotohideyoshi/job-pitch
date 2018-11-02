from rest_framework import serializers

from hr.models import Job, Employee


class JobSerializer(serializers.ModelSerializer):
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


class EmployeeSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    job = JobSerializer()

    class Meta(object):
        model = Employee
        fields = (
            'id',
            'business',
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
