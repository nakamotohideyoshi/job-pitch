from django.db import transaction
from rest_framework import serializers

from mjp.models import Message, Application, Role, TokenStore, ApplicationStatus, ApplicationPitch, Interview
from mjp.serializers import (
    JobSerializerV1,
    JobSerializerV2,
    JobSerializer,
    JobSeekerReadSerializerV1,
    JobSeekerReadSerializer,
    SimpleSerializer,
)


class MessageSerializerV1(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'system', 'content', 'read', 'created', 'application', 'from_role')


class ApplicationSerializerV1(serializers.ModelSerializer):
    job_data = JobSerializerV1(source='job', read_only=True)
    job_seeker = JobSeekerReadSerializerV1(read_only=True)
    messages = MessageSerializerV1(many=True, read_only=True)
    status = serializers.SerializerMethodField()

    def get_status(self, application):
        if application.status.name in ApplicationStatus.OFFER_STATUSES:
            return ApplicationStatus.objects.get(name=ApplicationStatus.ESTABLISHED).pk
        return application.status.pk

    class Meta:
        model = Application
        read_only_fields = ('status', 'created_by', 'deleted_by', 'job', 'shortlisted',)


class ApplicationSerializerV2(ApplicationSerializerV1):
    job_data = JobSerializerV2(source='job', read_only=True)


class EmbeddedApplicationPitchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationPitch
        exclude = ('token', 'job_seeker', 'application')


class EmbeddedInterviewSerializer(serializers.ModelSerializer):
    messages = SimpleSerializer(Message)(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = ('id', 'at', 'messages', 'notes', 'feedback', 'cancelled', 'cancelled_by', 'status')


class MessageSerializer(MessageSerializerV1):  # v2
    class Meta:
        model = Message
        fields = MessageSerializerV1.Meta.fields + ('interview',)


class ApplicationSerializerV3(ApplicationSerializerV2):
    pitches = EmbeddedApplicationPitchSerializer(read_only=True, many=True)
    interviews = EmbeddedInterviewSerializer(read_only=True, many=True)
    messages = MessageSerializer(many=True, read_only=True)


class ApplicationSerializerV4(ApplicationSerializerV3):  # v4
    job_seeker = JobSeekerReadSerializer(read_only=True)


class ApplicationSerializerV5(ApplicationSerializerV4):  # v5
    job_data = JobSerializer(source='job', read_only=True)


class ApplicationSerializer(ApplicationSerializerV5):  # v6
    status = serializers.PrimaryKeyRelatedField(read_only=True)


class ExternalApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('id', 'job', 'job_seeker', 'shortlisted')


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
        if self.instance.status.name != ApplicationStatus.CREATED:
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


class ApplicationOfferSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if self.instance.status.name == ApplicationStatus.DELETED:
            raise serializers.ValidationError('Application deleted')
        if self.instance.status.name != ApplicationStatus.ESTABLISHED:
            raise serializers.ValidationError('Application must be established')
        return super(ApplicationOfferSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        with transaction.atomic():
            validated_data['status'] = ApplicationStatus.objects.get(name=ApplicationStatus.OFFERED)
            return super(ApplicationOfferSerializer, self).update(instance, validated_data)

    class Meta:
        model = Application
        fields = ()
        read_only_fields = ('id',)


class ApplicationAcceptSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if self.instance.status.name == ApplicationStatus.DELETED:
            raise serializers.ValidationError('Application deleted')
        if self.instance.status.name != ApplicationStatus.OFFERED:
            raise serializers.ValidationError('Application must be offered')
        return super(ApplicationAcceptSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        with transaction.atomic():
            validated_data['status'] = ApplicationStatus.objects.get(name=ApplicationStatus.ACCEPTED)
            return super(ApplicationAcceptSerializer, self).update(instance, validated_data)

    class Meta:
        model = Application
        fields = ()
        read_only_fields = ('id',)


class ApplicationDeclineSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if self.instance.status.name == ApplicationStatus.DELETED:
            raise serializers.ValidationError('Application deleted')
        if self.instance.status.name != ApplicationStatus.OFFERED:
            raise serializers.ValidationError('Application must be offered')
        return super(ApplicationDeclineSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        with transaction.atomic():
            validated_data['status'] = ApplicationStatus.objects.get(name=ApplicationStatus.DECLINED)
            return super(ApplicationDeclineSerializer, self).update(instance, validated_data)

    class Meta:
        model = Application
        fields = ()
        read_only_fields = ('id',)


class ApplicationRevokeSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if self.instance.status.name == ApplicationStatus.DELETED:
            raise serializers.ValidationError('Application deleted')
        if self.instance.status.name not in ApplicationStatus.OFFER_STATUSES:
            raise serializers.ValidationError('Application must be offered')
        return super(ApplicationRevokeSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        with transaction.atomic():
            validated_data['status'] = ApplicationStatus.objects.get(name=ApplicationStatus.ESTABLISHED)
            return super(ApplicationRevokeSerializer, self).update(instance, validated_data)

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


class InterviewSerializer(serializers.ModelSerializer):
    invitation = serializers.CharField(allow_blank=True, write_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = (
            'id',
            'invitation',
            'application',
            'at',
            'messages',
            'notes',
            'feedback',
            'cancelled',
            'cancelled_by',
            'status',
        )
        read_only_fields = ('cancelled', 'cancelled_by', 'status')


class InterviewCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = (
            'notes',
            'feedback',
        )
