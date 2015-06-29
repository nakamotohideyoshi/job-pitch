from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from rest_framework import serializers

from models import Business, Location, JobProfile, LocationImage, \
    BusinessImage, Job, JobSeeker, Experience, Application, Message, \
    Pitch


def SimpleSerializer(m, overrides={}):
    class Meta:
        model = m
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
        return {'image': request.build_absolute_uri(url),
                'thumbnail': request.build_absolute_uri(thumbnail_url),
                }
    
    
class UserDetailsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'businesses', 'job_seeker')
        read_only_fields = ('id', 'username', 'job_seeker', 'businesses')


class BusinessSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    locations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)
    
    class Meta:
        model = Business


class LocationSerializer(serializers.ModelSerializer):
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    latitude = serializers.FloatField(source='latlng.x')
    longitude = serializers.FloatField(source='latlng.y')
    images = RelatedImageURLField(many=True, read_only=True)
    business_data = BusinessSerializer(source='business', read_only=True)
    
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



class JobSerializer(serializers.ModelSerializer):
    location_data = LocationSerializer(source='location', read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)
        
    class Meta:
        model = Job


class JobSeekerSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    experience = SimpleSerializer(Experience)(many=True, read_only=True)
    pitch = SimpleSerializer(Pitch)(read_only=True)
    
    class Meta:
        model = JobSeeker


class ApplicationSerializer(serializers.ModelSerializer):
    job_data = JobSerializer(source='job', read_only=True)
    job_seeker = JobSeekerSerializer(read_only=True)
    messages = SimpleSerializer(Message)(many=True, read_only=True)
    
    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by')


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by')


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('id', 'shortlisted',)
        read_only_fields = ('id',)


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('application', 'content') 

class MessageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('read',)


class PitchSerializer(serializers.ModelSerializer):
    file = serializers.FileField(source='video')
    thumbnail = serializers.ImageField(read_only=True)
        
    class Meta:
        model = Pitch
        fields = ('thumbnail', 'file')
