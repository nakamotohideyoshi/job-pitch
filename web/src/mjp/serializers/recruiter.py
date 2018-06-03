from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from mjp.models import BusinessUser, BusinessImage, LocationImage, JobImage, JobVideo, Interview, Message, Role


class BusinessImageSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(read_only=True)

    def validate_business(self, value):
        request = self.context['request']
        try:
            business_user = request.user.business_users.get(business=value)
        except BusinessUser.DoesNotExist:
            raise PermissionDenied()
        if business_user.locations.exists():
            raise PermissionDenied()
        return value

    class Meta:
        model = BusinessImage


class LocationImageSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(read_only=True)

    def validate_location(self, value):
        request = self.context['request']
        try:
            business_user = request.user.business_users.get(business=value.business)
        except BusinessUser.DoesNotExist:
            raise PermissionDenied()
        if business_user.locations.exists() and not business_user.locations.filter(pk=value.pk).exists():
            raise PermissionDenied()
        return value

    class Meta:
        model = LocationImage


class JobImageSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(read_only=True)

    def validate_job(self, value):
        request = self.context['request']
        try:
            business_user = request.user.business_users.get(business=value.location.business)
        except BusinessUser.DoesNotExist:
            raise PermissionDenied()
        if business_user.locations.exists() and not business_user.locations.filter(pk=value.location.pk).exists():
            raise PermissionDenied()
        return value

    class Meta:
        model = JobImage


class JobVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobVideo
        read_only_fields = ('token',)


class InterviewSerializer(serializers.ModelSerializer):
    invitation = serializers.CharField(allow_blank=True, write_only=True)

    def create(self, validated_data):
        invitation = validated_data.pop('invitation')
        interview = super(InterviewSerializer, self).create(validated_data)
        Message.objects.create(
            application=validated_data['application'],
            from_role=Role.objects.get(name=Role.RECRUITER),
            content=invitation,
            interview=interview,
        )
        return interview

    class Meta:
        model = Interview
        fields = ('invitation', 'application', 'at', 'messages', 'notes', 'feedback')
        read_only_fields = ('messages',)
