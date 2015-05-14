from django.contrib.auth import get_user_model
from rest_framework import serializers
from models import Location, JobProfile
from django.contrib.gis.geos import Point

def SimpleSerializer(m, overrides={}):
    class Meta:
        model = m
    fields = {'Meta': Meta}
    fields.update(overrides)
    return type(str("%sSerializer" % m._meta.object_name),
                (serializers.ModelSerializer,),
                fields,
                )

class UserDetailsSerializer(serializers.ModelSerializer):
    """
    User model w/o password
    """
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'businesses', 'job_seeker')
        read_only_fields = ('id', 'username', 'job_seeker', 'businesses')


class LocationSerializer(serializers.ModelSerializer):
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    latitude = serializers.FloatField(source='latlng.x')
    longitude = serializers.FloatField(source='latlng.y')
    
    def save(self, **kwargs):
        self.validated_data['latlng'] = Point(**self.validated_data['latlng'])
        return super(LocationSerializer, self).save(**kwargs)
    
    class Meta:
        model = Location
        exclude = ('latlng',)


class JobProfileSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(source='latlng.x')
    longitude = serializers.FloatField(source='latlng.y')
    
    def save(self, **kwargs):
        self.validated_data['latlng'] = Point(**self.validated_data['latlng'])
        return super(JobProfileSerializer, self).save(**kwargs)
    
    class Meta:
        model = JobProfile
        exclude = ('latlng',)
