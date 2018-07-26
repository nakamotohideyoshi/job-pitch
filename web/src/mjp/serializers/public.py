from rest_framework import serializers

from mjp.models import Contract, Sector, Hours, Location, Job, Business, JobSeeker
from mjp.serializers import SimpleSerializer, RelatedImageURLField, EmbeddedPitchSerializer


class PublicEmbeddedBusinessListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)

    class Meta:
        model = Business
        fields = ('name', 'images')


class PublicEmbeddedLocationListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')
    business = PublicEmbeddedBusinessListingSerializer()

    class Meta:
        model = Location
        fields = ('name', 'images', 'longitude', 'latitude', 'business')


class PublicEmbeddedJobListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)
    sector = SimpleSerializer(Sector, meta_overrides={'fields': ('name', 'description')})()
    contract = SimpleSerializer(Contract, meta_overrides={'fields': ('name', 'short_name', 'description')})()
    hours = SimpleSerializer(Hours, meta_overrides={'fields': ('name', 'short_name', 'description')})()

    class Meta:
        model = Job
        fields = ('title', 'description', 'images', 'sector', 'contract', 'hours')


class PublicJobListingSerializer(PublicEmbeddedJobListingSerializer):
    location_data = PublicEmbeddedLocationListingSerializer(source='location')

    class Meta:
        model = Job
        fields = PublicEmbeddedJobListingSerializer.Meta.fields + ('location_data',)


class PublicLocationListingSerializer(PublicEmbeddedLocationListingSerializer):
    jobs = PublicEmbeddedJobListingSerializer(many=True)

    class Meta:
        model = Location
        fields = PublicEmbeddedLocationListingSerializer.Meta.fields + ('jobs',)


class PublicBusinessListingSerializer(PublicEmbeddedBusinessListingSerializer):
    locations = PublicLocationListingSerializer(many=True)

    class Meta:
        model = Business
        fields = PublicEmbeddedBusinessListingSerializer.Meta.fields + ('locations',)


class PublicJobSeekerListingSerializerV1(serializers.ModelSerializer):
    pitches = EmbeddedPitchSerializer(many=True, read_only=True)

    email = serializers.SerializerMethodField()
    telephone = serializers.SerializerMethodField()
    mobile = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    sex = serializers.SerializerMethodField()
    nationality = serializers.SerializerMethodField()
    has_national_insurance_number = serializers.SerializerMethodField()

    def get_email(self, value):
        if value.email_public:
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
            'has_references',
            'has_national_insurance_number',
            'pitches',
        )


class PublicJobSeekerListingSerializer(PublicJobSeekerListingSerializerV1):  # v4
    class Meta:
        model = JobSeeker
        fields = PublicJobSeekerListingSerializerV1.Meta.fields + ('profile_image', 'profile_thumb')
