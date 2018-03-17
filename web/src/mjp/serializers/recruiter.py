from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from mjp.models import BusinessUser, BusinessImage, LocationImage, JobImage


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