from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.db import transaction
from rest_framework import serializers

from models import (
    Business,
    Location,
    JobProfile,
    Job,
    JobSeeker,
    Message,
    Application,
    Pitch,
    ApplicationStatus,
    Role,
    TokenStore,
    InitialTokens,
)

from rest_auth.serializers import LoginSerializer as BaseLoginSerializer
from rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer


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


class RegisterSerializer(BaseRegisterSerializer):
    def __init__(self, *args, **kwargs):
        super(RegisterSerializer, self).__init__(*args, **kwargs)
        del self.fields['username']

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', '')
        }


class LoginSerializer(BaseLoginSerializer):
    def __init__(self, *args, **kwargs):
        super(LoginSerializer, self).__init__(*args, **kwargs)
        del self.fields['username']


class UserDetailsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'businesses', 'job_seeker', 'can_create_businesses')
        read_only_fields = ('id', 'email', 'businesses', 'job_seeker', 'can_create_businesses')


class BusinessSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    locations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    images = RelatedImageURLField(many=True, read_only=True)
    tokens = serializers.IntegerField(source='token_store.tokens', read_only=True)
    
    class Meta:
        model = Business
        fields = ('id', 'users', 'locations', 'images', 'name', 'created', 'updated', 'tokens',)


class LocationSerializer(serializers.ModelSerializer):
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')
    images = RelatedImageURLField(many=True, read_only=True)
    business_data = BusinessSerializer(source='business', read_only=True)
    active_job_count = serializers.SerializerMethodField()

    def get_active_job_count(self, obj):
        return obj.jobs.filter(status__name="OPEN").count()
    
    def save(self, **kwargs):
        self.validated_data['latlng'] = Point(**self.validated_data['latlng'])
        return super(LocationSerializer, self).save(**kwargs)
    
    class Meta:
        model = Location
        exclude = ('latlng',)


class JobProfileSerializer(serializers.ModelSerializer):
    longitude = serializers.FloatField(source='latlng.x')
    latitude = serializers.FloatField(source='latlng.y')
    
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
    class PitchSerializer(serializers.ModelSerializer):
        class Meta:
            model = Pitch
            exclude = ('token', 'job_seeker')
            
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    pitches = PitchSerializer(many=True, read_only=True)
    email = serializers.EmailField(read_only=True, source='user.email')
    
    class Meta:
        model = JobSeeker


class ApplicationSerializer(serializers.ModelSerializer):
    job_data = JobSerializer(source='job', read_only=True)
    job_seeker = JobSeekerSerializer(read_only=True)
    messages = SimpleSerializer(Message)(many=True, read_only=True)
    
    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by', 'job', 'shortlisted',)


class ApplicationCreateSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        with transaction.atomic():
            if validated_data['created_by'] == Role.objects.get(name='RECRUITER'):
                try:
                    validated_data['job'].location.business.token_store.decrement()
                except TokenStore.NoTokens:
                    raise serializers.ValidationError('NO_TOKENS')
            return super(ApplicationCreateSerializer, self).create(validated_data)

    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by')


class ApplicationConnectSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if self.instance.status.name == ApplicationStatus.DELETED:
            raise serializers.ValidationError('Application deleted')
        if self.instance.status.name == ApplicationStatus.ESTABLISHED:
            raise serializers.ValidationError('Application already established')
        return super(ApplicationConnectSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        with transaction.atomic():
            try:
                self.instance.job.location.business.token_store.decrement()
            except TokenStore.NoTokens:
                raise serializers.ValidationError('NO_TOKENS')
            validated_data['status'] = ApplicationStatus.objects.get(name=ApplicationStatus.ESTABLISHED)
            return super(ApplicationConnectSerializer, self).update(instance, validated_data)

    class Meta:
        model = Application
        fields = ()
        read_only_fields = ('id',)


class ApplicationShortlistUpdateSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Pitch
        read_only_fields = ('token', 'job_seeker',)


class AndroidPurchaseSerializer(serializers.Serializer):
    business_id = serializers.IntegerField()
    product_code = serializers.CharField()
    purchase_token = serializers.CharField()


class PayPalPurchaseSerializer(serializers.Serializer):
    business = serializers.IntegerField()
    product_code = serializers.CharField()


class InitialTokensSerializer(serializers.ModelSerializer):
    class Meta:
        model = InitialTokens
        fields = ('tokens',)
