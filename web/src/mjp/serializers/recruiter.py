from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from mjp.models import BusinessUser, BusinessImage, LocationImage, JobImage, JobVideo, User


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


class BusinessUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = BusinessUser
        fields = ('id', 'user', 'email', 'locations', 'business')


class BusinessUserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    def validate_business(self, value):
        request = self.context['request']
        try:
            business_user = request.user.business_users.get(business=value)
        except BusinessUser.DoesNotExist:
            raise PermissionDenied()
        if business_user.locations.exists():
            raise PermissionDenied()
        return value

    def validate(self, attrs):
        business = self.context['business']
        for location in attrs['locations']:
            if location.business != business:
                raise serializers.ValidationError({
                    'locations': 'All locations must be in the same business',
                })
        return attrs

    def create(self, validated_data):
        data = dict(validated_data)
        email = data.pop('email')
        user, created = User.objects.get_or_create(
            email=email,
        )
        data['user'] = user
        data['business'] = self.context['business']
        return super(BusinessUserCreateSerializer, self).create(data)

    class Meta:
        model = BusinessUser
        fields = ('email', 'locations')


class BusinessUserUpdateSerializer(serializers.ModelSerializer):
    def validate_locations(self, value):
        for location in value:
            if location.business != self.instance.business:
                raise serializers.ValidationError({
                    'locations': 'All locations must be in the same business',
                })
        return value

    class Meta:
        model = BusinessUser
        fields = ('locations',)
