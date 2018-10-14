import uuid

from django.contrib.gis.geos import Point
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from mjp.models import (
    BusinessUser,
    BusinessImage,
    LocationImage,
    JobImage,
    JobVideo,
    User,
    Exclusion,
    Location,
    JobStatus,
    Business,
    Job,
)
from mjp.serializers import DummyField, RelatedImageURLField, EmbeddedVideoSerializer


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
    email = serializers.EmailField(write_only=True)
    new_user = False

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
        business = self.context['business']
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
            )
            if not created and BusinessUser.objects.filter(
                        user=user,
                        business=business,
                    ).exists():
                raise serializers.ValidationError({
                    'email': 'This user already exists',
                })
            if created:
                user.set_password(str(uuid.uuid4()))
                user.save()
            self.new_user = created
            data['user'] = user
            data['business'] = business
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


class ExclusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exclusion
        fields = ('id', 'job', 'job_seeker')
        read_only_fields = ('job',)


class UserBusinessSerializerV1(serializers.ModelSerializer):  # v1
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    locations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)
    tokens = serializers.IntegerField(source='token_store.tokens', read_only=True)

    class Meta(object):
        model = Business
        fields = ('id', 'users', 'locations', 'images', 'name', 'created', 'updated', 'tokens',)


class UserBusinessSerializerV5(UserBusinessSerializerV1):  # v5
    restricted = serializers.SerializerMethodField()

    def get_restricted(self, business):
        user = self.context['request'].user
        business_user = business.business_users.get(user=user)
        return business_user.locations.exists()

    class Meta(UserBusinessSerializerV1.Meta):
        fields = UserBusinessSerializerV1.Meta.fields + ('restricted',)


class UserBusinessSerializer(UserBusinessSerializerV5):  # v7
    class Meta(UserBusinessSerializerV5.Meta):
        fields = UserBusinessSerializerV5.Meta.fields + ('hr_access', 'employee_level', 'suspended')
        read_only_fields = ('hr_access', 'employee_level', 'suspended')


class UserLocationSerializerV1(serializers.ModelSerializer):  # v1
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source='adverts')
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')
    images = RelatedImageURLField(many=True, read_only=True)
    business_data = UserBusinessSerializerV1(source='business', read_only=True)
    active_job_count = serializers.SerializerMethodField()
    postcode_lookup = DummyField(source='*', required=False)
    address = DummyField(source='*', required=False)

    def get_active_job_count(self, obj):
        return obj.adverts.filter(status__name=JobStatus.OPEN).count()

    def validate_business(self, value):
        request = self.context['request']
        try:
            business_user = request.user.business_users.get(business=value)
        except BusinessUser.DoesNotExist:
            raise PermissionDenied()
        if business_user.locations.exists():
            raise PermissionDenied()
        return value

    def save(self, **kwargs):
        if 'latlng' in self.validated_data:
            self.validated_data['latlng'] = Point(**self.validated_data['latlng'])
        return super(UserLocationSerializerV1, self).save(**kwargs)

    class Meta(object):
        model = Location
        fields = (
            'id',
            'business',
            'name',
            'description',
            'address',
            'place_id',
            'place_name',
            'postcode_lookup',
            'email',
            'email_public',
            'telephone',
            'telephone_public',
            'mobile',
            'mobile_public',
            'jobs',
            'longitude',
            'latitude',
            'images',
            'business_data',
            'active_job_count',
            'created',
            'updated',
        )


class UserLocationSerializerV5(UserLocationSerializerV1):  # v5
    business_data = UserBusinessSerializer(source='business', read_only=True)


class UserLocationSerializer(UserLocationSerializerV5):  # v6
    street_number = serializers.CharField(max_length=1024)
    street = serializers.CharField(max_length=1024)
    postcode = serializers.CharField(max_length=50)
    city = serializers.CharField(max_length=1024)
    region = serializers.CharField(max_length=1024)
    country = serializers.CharField(max_length=1024)

    class Meta(UserLocationSerializerV1.Meta):
        fields = tuple(f for f in UserLocationSerializerV1.Meta.fields if f not in ('address', 'postcode_lookup')) + (
            'street_number',
            'street',
            'postcode',
            'city',
            'region',
            'country',
        )


class UserJobSerializerV1(serializers.ModelSerializer):  # v1
    location_data = UserLocationSerializerV1(source='location', read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)

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
        model = Job
        fields = (
            'id',
            'title',
            'description',
            'images',
            'sector',
            'hours',
            'contract',
            'status',
            'location',
            'location_data',
            'created',
            'updated',
        )


class UserJobSerializerV2(UserJobSerializerV1):  # v2
    videos = EmbeddedVideoSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = UserJobSerializerV1.Meta.fields + ('videos',)


class UserJobSerializerV5(UserJobSerializerV2):  # v5
    class Meta:
        model = Job
        fields = UserJobSerializerV2.Meta.fields + ('requires_pitch', 'requires_cv')


class UserJobSerializer(UserJobSerializerV5):  # v6
    location_data = UserLocationSerializer(source='location', read_only=True)
