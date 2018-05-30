from django.contrib.gis.geos import Point
from rest_framework import serializers

from mjp.models import Pitch, JobProfile, ApplicationPitch


class PitchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pitch
        read_only_fields = ('token', 'job_seeker',)


class ApplicationPitchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationPitch
        read_only_fields = ('token')


class JobProfileSerializer(serializers.ModelSerializer):
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')

    def save(self, **kwargs):
        self.validated_data['latlng'] = Point(**self.validated_data['latlng'])
        return super(JobProfileSerializer, self).save(**kwargs)

    class Meta:
        model = JobProfile
        exclude = ('latlng',)