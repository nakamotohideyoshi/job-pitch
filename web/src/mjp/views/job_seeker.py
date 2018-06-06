from django.contrib.gis.measure import D
from rest_framework import permissions, viewsets

from mjp.models import Business, Location, JobSeeker, JobProfile, Pitch, Job, JobStatus
from mjp.serializers import (
    BusinessSerializer,
    LocationSerializer,
    JobSerializer,
    JobSerializerV1,
)
from mjp.serializers.job_seeker import PitchSerializer, JobProfileSerializer


class BusinessViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BusinessSerializer
    queryset = Business.objects.all()


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = LocationSerializer
    queryset = Location.objects.all()
    # TODO hide non-public


class JobProfileViewSet(viewsets.ModelViewSet):
    class JobProfilePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('job_seeker')
            if pk:
                return JobSeeker.objects.filter(pk=pk, user=request.user).exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return obj.job_seeker.user == request.user

    def get_queryset(self):
        return JobProfile.objects.filter(job_seeker__user=self.request.user)

    permission_classes = (permissions.IsAuthenticated, JobProfilePermission)
    serializer_class = JobProfileSerializer


class PitchViewSet(viewsets.ModelViewSet):
    class PitchPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.user and request.user.is_authenticated():
                if request.method in permissions.SAFE_METHODS:
                    return True
                try:
                    request.user.job_seeker
                except JobSeeker.DoesNotExist:
                    return False
                return True
            if request.user.is_anonymous() and request.method in ('GET', 'PATCH'):
                return True
            return False

        def has_object_permission(self, request, view, obj):
            if request.user and request.user.is_authenticated():
                return obj.job_seeker == request.user.job_seeker
            if request.user.is_anonymous() and request.method in ('GET', 'PATCH'):
                return request.GET.get('token') == obj.token
            return False

    def get_queryset(self):
        query = super(PitchViewSet, self).get_queryset()
        if self.request.user.is_authenticated():
            return query.filter(job_seeker=self.request.user.job_seeker)
        if self.request.user.is_anonymous() and self.request.method in ('GET', 'PATCH'):
            return query.filter(token=self.request.GET.get('token'))

    def perform_create(self, serializer):
        job_seeker = self.request.user.job_seeker
        pitch = serializer.save(job_seeker=job_seeker)
        if pitch.video is None:
            # delete any pitch other uploads
            Pitch.objects.filter(job_seeker=job_seeker, video=None).exclude(pk=pitch.pk).delete()
        else:
            # delete any pitch except this one
            Pitch.objects.filter(job_seeker=job_seeker).exclude(pk=pitch.pk).delete()

    def perform_update(self, serializer):
        pitch = serializer.save()
        job_seeker = pitch.job_seeker
        if pitch.video is None:
            # delete any pitch other uploads
            Pitch.objects.filter(job_seeker=job_seeker, video=None).exclude(pk=pitch.pk).delete()
        else:
            # delete any pitch except this one
            Pitch.objects.filter(job_seeker=job_seeker).exclude(pk=pitch.pk).delete()

    permission_classes = (PitchPermission,)
    serializer_class = PitchSerializer
    queryset = Pitch.objects.all()


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    class JobPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            try:
                request.user.job_seeker
            except JobSeeker.DoesNotExist:
                return False
            return True

    permission_classes = (permissions.IsAuthenticated, JobPermission)

    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1
        if version > 1:
            return JobSerializer
        return JobSerializerV1

    def get_queryset(self):
        job_seeker = self.request.user.job_seeker
        job_profile = job_seeker.profile
        query = Job.objects.exclude(applications__job_seeker=job_seeker)
        exclude_pks = self.request.query_params.get('exclude')
        if exclude_pks:
            query = query.exclude(pk__in=map(int, exclude_pks.split(',')))
        if job_profile.contract_id:
            query = query.filter(contract=job_profile.contract)
        if job_profile.hours_id:
            query = query.filter(hours=job_profile.hours)
        query = query.filter(sector__in=job_profile.sectors.all())
        query = query.filter(status__name=JobStatus.OPEN)
        query = query.filter(location__latlng__distance_lte=(job_profile.latlng, D(mi=job_profile.search_radius)))
        return query

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
