from django.contrib.auth.models import User
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Availability, Business, Location,\
    JobStatus, Job, Sex, Nationality, JobSeeker, Experience, JobProfile,\
    ApplicationStatus, Application, Role
from mjp.serializers import SimpleSerializer

router = DefaultRouter()

def SimpleViewSet(model, base, permissions=(permissions.IsAuthenticated,), overrides={}, serializer_overrides={}):
    fields = {'queryset': model.objects.all(),
              'serializer_class':  SimpleSerializer(model, serializer_overrides),
              'permission_classes': permissions,
              }
    fields.update(overrides)
    cls = type(str('%sViewSet' % model._meta.object_name), (base,), fields,)
    router.register(model._meta.verbose_name_plural.lower().replace(' ', '-'), cls)
    return cls

def SimpleReadOnlyViewSet(model, **kwargs):
    return SimpleViewSet(model, viewsets.ReadOnlyModelViewSet, **kwargs)

def SimpleModelViewSet(model, **kwargs):
    return SimpleViewSet(model, viewsets.ModelViewSet, **kwargs)

SectorViewSet = SimpleReadOnlyViewSet(Sector)
ContractViewSet = SimpleReadOnlyViewSet(Contract)
HoursViewSet = SimpleReadOnlyViewSet(Hours)
AvailabilityViewSet = SimpleReadOnlyViewSet(Availability)
JobStatusViewSet = SimpleReadOnlyViewSet(JobStatus)
SexViewSet = SimpleReadOnlyViewSet(Sex)
NationalityViewSet = SimpleReadOnlyViewSet(Nationality)
ApplicationStatusViewSet = SimpleReadOnlyViewSet(ApplicationStatus)
RoleViewSet = SimpleReadOnlyViewSet(Role)

class BusinessViewSet(viewsets.ModelViewSet):
    class BusinessPermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return obj.users.filter(pk=int(request.user.pk)).exists()
    permission_classes = (permissions.IsAuthenticated, BusinessPermission)
    queryset = Business.objects.all()
    serializer_class = SimpleSerializer(Business, {'users': serializers.PrimaryKeyRelatedField(read_only=True)})
    def perform_create(self, serializer):
        serializer.save().users.add(self.request.user)
router.register('businesses', BusinessViewSet)

class LocationPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        pk = request.data.get('business')
        if pk:
            return Business.objects.filter(pk=pk, users__pk=int(request.user.pk)).exists()
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.businesses.filter(locations=obj).exists()
class LocationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, LocationPermission)
    queryset = Location.objects.all()
    serializer_class = SimpleSerializer(Location)
router.register('locations', LocationViewSet)

class JobPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        pk = request.data.get('location')
        if pk:
            return Location.objects.filter(pk=pk, business__users__pk=int(request.user.pk)).exists()
        return True
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.businesses.filter(locations__jobs=obj).exists()
class JobViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobPermission)
    queryset = Job.objects.all()
    serializer_class = SimpleSerializer(Job)
router.register('jobs', JobViewSet)

class JobSeekerPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
class JobSeekerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobSeekerPermission)
    queryset = JobSeeker.objects.all()
    serializer_class = SimpleSerializer(JobSeeker, {'user': serializers.PrimaryKeyRelatedField(read_only=True)})
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
router.register('job-seekers', JobSeekerViewSet)

class ExperiencePermission(permissions.BasePermission):
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
class ExperienceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, ExperiencePermission)
    queryset = Experience.objects.all()
    serializer_class = SimpleSerializer(Experience)
router.register('experience', ExperienceViewSet)

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
class JobProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobProfilePermission)
    queryset = JobProfile.objects.all()
    serializer_class = SimpleSerializer(JobProfile)
router.register('job-profiles', JobProfileViewSet)

class ApplicationPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        pk = request.data.get('job')
        if pk:
            job = Job.objects.get(pk=pk)
            is_recruiter = request.user.businesses.filter(locations__jobs=job).exists()
            if not is_recruiter and not request.user.job_seekers.exists():
                return False
        return True
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        is_recruiter = request.user.businesses.filter(locations__jobs__applications=obj).exists()
        return is_recruiter or obj.job_seeker.user == request.user
class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, ApplicationPermission)
    queryset = Application.objects.all()
    serializer_class = SimpleSerializer(Application, {'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                      'deleted_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                      })
    update_serializer_class = SimpleSerializer(Application,
                                               overrides={'job_seeker': serializers.PrimaryKeyRelatedField(read_only=True),
                                                          'job': serializers.PrimaryKeyRelatedField(read_only=True),
                                                          'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                          'deleted_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                          })
    def perform_create(self, serializer):
        job = Job.objects.get(pk=self.request.data['job'])
        if self.request.user.businesses.filter(locations__jobs=job).exists():
            role = Role.objects.get(name='RECRUITER')
        else:
            role = Role.objects.get(name='JOB_SEEKER')
        serializer.save(created_by=role)
        
    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return self.update_serializer_class
        return self.serializer_class
router.register('applications', ApplicationViewSet)
