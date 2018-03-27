from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.db.models import F, Q
from rest_framework import viewsets, permissions
from rest_framework.routers import DefaultRouter

from mjp.models import (
    Sector,
    Hours,
    Contract,
    JobStatus,
    Job,
    Sex,
    Nationality,
    JobSeeker,
    ApplicationStatus,
    Role,
    AppDeprecation,
    ProductTokens, PayPalProduct)
from mjp.serializers import (
    SimpleSerializer,
    JobSeekerSerializer,
    JobSeekerReadSerializer,
    AppDeprecationSerializer,
)
from mjp.views.applications import ApplicationViewSet, MessageViewSet
from mjp.views.job_seeker import JobProfileViewSet, PitchViewSet, BusinessViewSet, LocationViewSet, JobViewSet
from mjp.views.recruiter import UserBusinessViewSet, UserBusinessImageViewSet, UserLocationViewSet, \
    UserLocationImageViewSet, UserJobViewSet, UserJobImageViewSet


def SimpleViewSet(router, model, base, permissions=(permissions.IsAuthenticated,), overrides={},
                  serializer_overrides={}, serializer_meta_overrides={}):
    fields = {'queryset': model.objects.all(),
              'serializer_class': SimpleSerializer(model, serializer_overrides, serializer_meta_overrides),
              'permission_classes': permissions,
              }
    fields.update(overrides)
    cls = type(str('%sViewSet' % model._meta.object_name), (base,), fields, )
    router.register(model._meta.verbose_name_plural.lower().replace(' ', '-'), cls)
    return cls


def SimpleReadOnlyViewSet(router, model, **kwargs):
    return SimpleViewSet(router, model, viewsets.ReadOnlyModelViewSet, **kwargs)


# TODO split into js and recruiter
class JobSeekerViewSet(viewsets.ModelViewSet):
    class JobSeekerPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            pk = request.query_params.get('job')
            if pk:
                print "job pk: %s" % pk
                return Job.objects.filter(pk=pk, location__business__users__pk=int(request.user.pk)).exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return obj.user == request.user

    permission_classes = (permissions.IsAuthenticated, JobSeekerPermission)

    def get_serializer_class(self):
        if self.request.query_params.get('job'):
            return JobSeekerReadSerializer
        return JobSeekerSerializer

    def get_queryset(self):
        job = self.request.query_params.get('job')
        if job:
            job = Job.objects.select_related('sector', 'contract', 'hours').get(pk=self.request.query_params['job'])
            query = JobSeeker.objects.filter(active=True).prefetch_related('pitches', 'profile').distinct()
            query = query.filter(pitches__video__isnull=False)
            query = query.exclude(applications__job=job)
            query = query.exclude(profile=None)
            exclude_pks = self.request.query_params.get('exclude')
            if exclude_pks:
                query = query.exclude(pk__in=map(int, exclude_pks.split(',')))
            query = query.filter(Q(profile__contract=job.contract) | Q(profile__contract=None),
                                 Q(profile__hours=job.hours) | Q(profile__hours=None),
                                 profile__sectors=job.sector,
                                 )
            query = query.annotate(distance=Distance(F('profile__latlng'), job.location.latlng))
            query = query.filter(distance__lte=F('profile__search_radius') * D(mi=1).m)
            return query[:25]
        return JobSeeker.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AppDeprecationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AppDeprecation.objects.all()
    serializer_class = AppDeprecationSerializer


router = DefaultRouter()
SectorViewSet = SimpleReadOnlyViewSet(router, Sector, serializer_meta_overrides={'exclude': ('priority',)})
ContractViewSet = SimpleReadOnlyViewSet(router, Contract)
HoursViewSet = SimpleReadOnlyViewSet(router, Hours)
JobStatusViewSet = SimpleReadOnlyViewSet(router, JobStatus)
SexViewSet = SimpleReadOnlyViewSet(router, Sex)
NationalityViewSet = SimpleReadOnlyViewSet(router, Nationality)
ApplicationStatusViewSet = SimpleReadOnlyViewSet(router, ApplicationStatus)
RoleViewSet = SimpleReadOnlyViewSet(router, Role)
ProductTokensViewSet = SimpleReadOnlyViewSet(router, ProductTokens)
PayPalProductViewSet = SimpleReadOnlyViewSet(router, PayPalProduct)
router.register('job-seekers', JobSeekerViewSet, base_name='job-seeker')
router.register('deprecation', AppDeprecationViewSet, base_name='deprecation')
router.register('applications', ApplicationViewSet, base_name='application')
router.register('messages', MessageViewSet, base_name='message')
router.register('job-profiles', JobProfileViewSet, base_name='job-profile')
router.register('pitches', PitchViewSet, base_name='pitch')
router.register('businesses', BusinessViewSet, base_name='business')
router.register('locations', LocationViewSet, base_name='location')
router.register('jobs', JobViewSet, base_name='jobs')
router.register('user-businesses', UserBusinessViewSet, base_name='user-business')
router.register('user-business-images', UserBusinessImageViewSet, base_name='user-business-image')
router.register('user-locations', UserLocationViewSet, base_name='user-location')
router.register('user-location-images', UserLocationImageViewSet, base_name='user-location-image')
router.register('user-jobs', UserJobViewSet, base_name='user-job')
router.register('user-job-images', UserJobImageViewSet, base_name='user-job-image')