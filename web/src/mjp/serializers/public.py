from rest_framework import serializers

from mjp.models import (
    Contract,
    Sector,
    Hours,
    Location,
    Job,
    Business,
    JobSeeker,
    JobStatus,
    JobVideo,
)
from mjp.serializers import SimpleSerializer, RelatedImageURLField, EmbeddedPitchSerializer


class PublicEmbeddedBusinessListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)

    class Meta:
        model = Business
        fields = ('id', 'name', 'images')


class PublicEmbeddedLocationListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')

    class Meta:
        model = Location
        fields = ('id', 'name', 'description', 'images', 'longitude', 'latitude')


class PublicEmbeddedJobListingSerializer(serializers.ModelSerializer):
    images = RelatedImageURLField(many=True, read_only=True)
    videos = serializers.SerializerMethodField()
    sector = SimpleSerializer(Sector, meta_overrides={'fields': ('name', 'description')})()
    contract = SimpleSerializer(Contract, meta_overrides={'fields': ('name', 'short_name', 'description')})()
    hours = SimpleSerializer(Hours, meta_overrides={'fields': ('name', 'short_name', 'description')})()

    def get_videos(self, job):
        videos = job.videos.filter(video__isnull=False)
        serializer = SimpleSerializer(JobVideo, meta_overrides={'fields': ('video', 'thumbnail')})(
            instance=videos,
            many=True,
        )
        return serializer.data

    class Meta:
        model = Job
        fields = (
            'id',
            'title',
            'description',
            'images',
            'videos',
            'sector',
            'contract',
            'hours',
            'requires_pitch',
            'requires_cv',
        )


class PublicJobListingSerializer(PublicEmbeddedJobListingSerializer):
    location_data = PublicEmbeddedLocationListingSerializer(source='location')

    class Meta:
        model = Job
        fields = PublicEmbeddedJobListingSerializer.Meta.fields + ('location_data',)


class PublicLocationListingSerializer(PublicEmbeddedLocationListingSerializer):
    business_data = PublicEmbeddedBusinessListingSerializer(source='business')
    jobs = serializers.SerializerMethodField()

    def get_jobs(self, location):
        jobs = location.adverts.filter(status__name=JobStatus.OPEN)
        serializer = PublicEmbeddedJobListingSerializer(
            instance=jobs,
            many=True,
            context=self.context,
        )
        return serializer.data

    class Meta:
        model = Location
        fields = PublicEmbeddedLocationListingSerializer.Meta.fields + ('jobs', 'business_data')


class PublicBusinessListingSerializer(PublicEmbeddedBusinessListingSerializer):
    locations = PublicLocationListingSerializer(many=True)

    class Meta:
        model = Business
        fields = PublicEmbeddedBusinessListingSerializer.Meta.fields + ('locations',)


class PublicJobSeekerListingSerializerV1(serializers.ModelSerializer):
    pitches = EmbeddedPitchSerializer(many=True, read_only=True)

    class Meta:
        model = JobSeeker
        fields = (
            'id',
            'first_name',
            'last_name',
            'description',
            'pitches',
        )


class PublicJobSeekerListingSerializer(PublicJobSeekerListingSerializerV1):  # v4
    class Meta:
        model = JobSeeker
        fields = PublicJobSeekerListingSerializerV1.Meta.fields + ('profile_image', 'profile_thumb')
