from django.db import transaction
from rest_framework import serializers

from mjp.models import Message, Application, Role, TokenStore, ApplicationStatus, ApplicationPitch, Interview
from mjp.serializers import JobSerializer, JobSeekerReadSerializer, SimpleSerializer, JobSerializerV1


class ApplicationSerializerV1(serializers.ModelSerializer):
    job_data = JobSerializerV1(source='job', read_only=True)
    job_seeker = JobSeekerReadSerializer(read_only=True)
    messages = SimpleSerializer(Message)(many=True, read_only=True)

    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by', 'job', 'shortlisted',)


class ApplicationSerializerV2(ApplicationSerializerV1):
    job_data = JobSerializer(source='job', read_only=True)


class EmbeddedApplicationPitchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationPitch
        exclude = ('token', 'job_seeker', 'application')


class EmbeddedInterviewSerializer(serializers.ModelSerializer):
    messages = SimpleSerializer(Message)(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = ('at', 'messages', 'notes', 'feedback')


class ApplicationSerializer(ApplicationSerializerV2):
    pitches = EmbeddedApplicationPitchSerializer(read_only=True, many=True)
    interviews = EmbeddedInterviewSerializer(read_only=True, many=True)


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
