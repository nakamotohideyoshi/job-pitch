import re

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from mjp.models import (
    Business,
    Location,
    Job,
    JobSeeker,
    Pitch,
    AppDeprecation,
    BusinessUser,
    JobVideo,
    JobStatus,
    ApplicationStatus,
)


def SimpleSerializer(m, overrides={}, meta_overrides={}):
    class Meta(object):
        model = m
    for k, v in meta_overrides.items():
        setattr(Meta, k, v)
    fields = {'Meta': Meta}
    fields.update(overrides)
    return type(str("%sSerializer" % m._meta.object_name),
                (serializers.ModelSerializer,),
                fields,
                )


class RelatedImageURLField(serializers.RelatedField):
    def to_representation(self, value):
        url = value.image.url
        thumbnail_url = value.thumbnail.url
        request = self.context.get('request', None)
        return {'id': value.pk,
                'image': request.build_absolute_uri(url),
                'thumbnail': request.build_absolute_uri(thumbnail_url),
                }


class BusinessSerializerV1(serializers.ModelSerializer):  # v1
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    locations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)
    tokens = serializers.IntegerField(source='token_store.tokens', read_only=True)

    class Meta(object):
        model = Business
        fields = ('id', 'users', 'locations', 'images', 'name', 'created', 'updated', 'tokens',)


class BusinessSerializer(serializers.ModelSerializer):  # v6
    locations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)

    class Meta(BusinessSerializerV1.Meta):
        fields = ('id', 'locations', 'images', 'name')


class DummyField(serializers.Field):
    def to_internal_value(self, data):
        return {}

    def to_representation(self, value):
        return ''


class LocationSerializerV1(serializers.ModelSerializer):  # v1 /api/locations/
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source='adverts')
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')
    images = RelatedImageURLField(many=True, read_only=True)
    business_data = BusinessSerializerV1(source='business', read_only=True)
    active_job_count = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    telephone = serializers.SerializerMethodField()
    mobile = serializers.SerializerMethodField()
    postcode_lookup = DummyField(source='*')
    address = DummyField(source='*')

    def get_email(self, value):
        if value.email_public:
            return value.email
        return ''

    def get_telephone(self, value):
        if value.telephone_public:
            return value.telephone
        return ''

    def get_mobile(self, value):
        if value.mobile_public:
            return value.mobile
        return ''

    def get_active_job_count(self, obj):
        return obj.adverts.filter(status__name=JobStatus.OPEN).count()

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


class LocationSerializer(LocationSerializerV1):  # v6 /api/locations/
    business_data = BusinessSerializer(source='business', read_only=True)

    class Meta(LocationSerializerV1.Meta):
        fields = (
            'id',
            'business',
            'name',
            'description',
            'place_name',
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
        )


class JobSerializerV1(serializers.ModelSerializer):  # v1
    location_data = LocationSerializerV1(source='location', read_only=True)
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


class EmbeddedVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobVideo
        exclude = ('token', 'job')


class JobSerializerV2(JobSerializerV1):  # v2
    videos = EmbeddedVideoSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = JobSerializerV1.Meta.fields + ('videos',)


class JobSerializerV5(JobSerializerV2):  # v5
    class Meta:
        model = Job
        fields = JobSerializerV2.Meta.fields + ('requires_pitch', 'requires_cv')


class JobSerializer(JobSerializerV5):  # v6
    location_data = LocationSerializer(source='location', read_only=True)


class EmbeddedPitchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pitch
        exclude = ('token', 'job_seeker')


class JobSeekerSerializerV1(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    pitches = EmbeddedPitchSerializer(many=True, read_only=True)
    email = serializers.EmailField(read_only=True, source='user.email')

    ni_regex = re.compile(
        pattern=r"""
                ^                      # Beginning of string
                [A-CEGHJ-PR-TW-Z]{1}   # Match first letter, cannot be D, F, I, Q, U or V
                [A-CEGHJ-NPR-TW-Z]{1}  # Match second letter, cannot be D, F, I, O, Q, U or V
                [0-9]{6}               # Six digits
                [A-D]{1}               # Match last letter can only be A, B, C or D
                $                      # End of string
                """,
        flags=re.VERBOSE,
    )
    pair_regex = re.compile(r"..?")

    def validate_national_insurance_number(self, value):
        value = value.replace(' ', '').upper()
        if value and not self.ni_regex.match(value):
            raise serializers.ValidationError("Invalid National Insurance number")
        value = " ".join(self.pair_regex.findall(value))
        return value

    class Meta:
        model = JobSeeker
        exclude = ("pitch_reminder_sent", "profile_image", "profile_thumb")


class JobSeekerSerializer(JobSeekerSerializerV1):  # v4
    class Meta:
        model = JobSeeker
        exclude = ("pitch_reminder_sent",)


class JobSeekerReadSerializerV1(serializers.ModelSerializer):
    pitches = EmbeddedPitchSerializer(many=True, read_only=True)

    email = serializers.SerializerMethodField()
    telephone = serializers.SerializerMethodField()
    mobile = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    sex = serializers.SerializerMethodField()
    nationality = serializers.SerializerMethodField()
    has_national_insurance_number = serializers.SerializerMethodField()

    def get_email(self, value):
        if value.user and value.email_public:
            return value.user.email
        return ''

    def get_telephone(self, value):
        if value.telephone_public:
            return value.telephone
        return ''

    def get_mobile(self, value):
        if value.mobile_public:
            return value.mobile
        return ''

    def get_age(self, value):
        if value.age_public:
            return value.age
        return None

    def get_sex(self, value):
        if value.sex_public:
            return value.sex_id
        return None

    def get_nationality(self, value):
        if value.nationality_public:
            return value.nationality_id
        return None

    def get_has_national_insurance_number(self, value):
        return bool(value.national_insurance_number)

    class Meta:
        model = JobSeeker
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'email_public',
            'telephone',
            'telephone_public',
            'mobile',
            'mobile_public',
            'age',
            'age_public',
            'sex',
            'sex_public',
            'nationality',
            'nationality_public',
            'description',
            'cv',
            'has_references',
            'has_national_insurance_number',
            'truth_confirmation',
            'created',
            'updated',
            'pitches',
        )


class JobSeekerReadSerializer(JobSeekerReadSerializerV1):  # v4
    class Meta:
        model = JobSeeker
        fields = JobSeekerReadSerializerV1.Meta.fields + ('profile_image', 'profile_thumb')


class AppDeprecationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppDeprecation
        fields = ('platform', 'warning', 'error',)


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = ApplicationStatus
        fields = ('id', 'name', 'friendly_name', 'description')
