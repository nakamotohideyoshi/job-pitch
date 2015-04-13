from django.contrib.auth.models import User
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Business, Location,\
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
JobStatusViewSet = SimpleReadOnlyViewSet(JobStatus)
SexViewSet = SimpleReadOnlyViewSet(Sex)
NationalityViewSet = SimpleReadOnlyViewSet(Nationality)
ApplicationStatusViewSet = SimpleReadOnlyViewSet(ApplicationStatus)
RoleViewSet = SimpleReadOnlyViewSet(Role)
BusinessViewSet = SimpleReadOnlyViewSet(Business)
LocationViewSet = SimpleReadOnlyViewSet(Location)
JobViewSet = SimpleReadOnlyViewSet(Job)

class UserBusinessViewSet(viewsets.ModelViewSet):
    class BusinessPermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return obj.users.filter(pk=int(request.user.pk)).exists()
    permission_classes = (permissions.IsAuthenticated, BusinessPermission)
    serializer_class = SimpleSerializer(Business, {'users': serializers.PrimaryKeyRelatedField(many=True, read_only=True),
                                                   'locations': serializers.PrimaryKeyRelatedField(many=True, read_only=True),
                                                   })
    def perform_create(self, serializer):
        serializer.save().users.add(self.request.user)
        
    def get_queryset(self):
        return Business.objects.filter(users=self.request.user)
router.register('user-businesses', UserBusinessViewSet, base_name='user-business')

class LocationPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        pk = request.data.get('business')
        print "business pk: %s" % pk
        if pk:
            return Business.objects.filter(pk=pk, users__pk=int(request.user.pk)).exists()
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.businesses.filter(locations=obj).exists()
class UserLocationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, LocationPermission)
    serializer_class = SimpleSerializer(Location, {'jobs': serializers.PrimaryKeyRelatedField(many=True, read_only=True),
                                                   })
    
    def get_queryset(self):
        business = self.request.QUERY_PARAMS.get('business', None)
        query = Location.objects.filter(business__users=self.request.user)
        if business:
            return query.filter(business__id=business)
        return query
router.register('user-locations', UserLocationViewSet, base_name='user-location')

class JobPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        pk = request.QUERY_PARAMS.get('location')
        if pk:
            return Location.objects.filter(pk=pk, business__users__pk=int(request.user.pk)).exists()
        return True
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.businesses.filter(locations__jobs=obj).exists()
class JobViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobPermission)
    serializer_class = SimpleSerializer(Job)
    
    def get_queryset(self):
        location = self.request.QUERY_PARAMS.get('location', None)
        query = Job.objects.filter(location__business__users=self.request.user)
        if location:
            return query.filter(location__id=location)
        return query
router.register('user-jobs', JobViewSet, base_name='user-job')

class JobSeekerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        pk = request.QUERY_PARAMS.get('job')
        if pk:
            print "job pk: %s" % pk
            return Job.objects.filter(pk=pk, location__business__users__pk=int(request.user.pk)).exists()
        return True
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
class JobSeekerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobSeekerPermission)
    serializer_class = SimpleSerializer(JobSeeker, {'user': serializers.PrimaryKeyRelatedField(read_only=True),
                                                    'profile': serializers.PrimaryKeyRelatedField(many=True, read_only=True),
                                                    'experience': SimpleSerializer(Experience)(many=True, read_only=True),
                                                    })
    
    def get_queryset(self):
        job = self.request.QUERY_PARAMS.get('job')
        if job:
            applied = self.request.QUERY_PARAMS.get('applied')
            if applied == '1':
                shortlisted = self.request.QUERY_PARAMS.get('shortlisted')
                if shortlisted == '1':
                    return JobSeeker.objects.filter(applications__job__pk=job, applications__shortlisted=True)
                else:
                    return JobSeeker.objects.filter(applications__job__pk=job)
            else:
                # TODO search criteria
                return JobSeeker.objects.exclude(applications__job__pk=job)
        else:
            return JobSeeker.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
router.register('job-seekers', JobSeekerViewSet, base_name='job-seeker')

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
            try:
                request.user.job_seeker
            except JobSeeker.DoesNotExist:
                is_job_seeker = False
            else:
                is_job_seeker = True
            if not is_recruiter and not is_job_seeker:
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
