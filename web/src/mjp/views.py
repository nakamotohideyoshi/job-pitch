from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Business, Location,\
    JobStatus, Job, Sex, Nationality, JobSeeker, Experience, JobProfile,\
    ApplicationStatus, Application, Role, LocationImage, BusinessImage

from mjp.serializers import SimpleSerializer, BusinessSerializer, LocationSerializer, JobProfileSerializer


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

class BusinessViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BusinessSerializer
    queryset = Business.objects.all()
router.register('businesses', BusinessViewSet, base_name='business')

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


class UserLocationImageViewSet(viewsets.ModelViewSet):
    class UserLocationImagePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('location')
            print "location pk: %s" % pk
            if pk:
                return Location.objects.filter(pk=pk, business__users=request.user).exists()
            return True
        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.businesses.filter(locations=obj.location).exists()
    permission_classes = (permissions.IsAuthenticated, UserLocationImagePermission,)
    serializer_class = SimpleSerializer(LocationImage, {'thumbnail': serializers.ImageField(read_only=True)})
    queryset = LocationImage.objects.all()
    # TODO hide non-public
router.register('user-location-images', UserLocationImageViewSet, base_name='user-location-image')

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
    serializer_class = LocationSerializer
    
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        print serializer.data
        return super(UserLocationViewSet, self).retrieve(request, pk)

    def get_queryset(self):
        business = self.request.QUERY_PARAMS.get('business', None)
        query = Location.objects.filter(business__users=self.request.user)
        if business:
            return query.filter(business__id=business)
        return query
router.register('user-locations', UserLocationViewSet, base_name='user-location')

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = LocationSerializer
    queryset = Location.objects.all()
    # TODO hide non-public
router.register('locations', LocationViewSet, base_name='location')

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
JobSeekerSerializer = SimpleSerializer(JobSeeker, {'user': serializers.PrimaryKeyRelatedField(read_only=True),
                                                   'profile': serializers.PrimaryKeyRelatedField(read_only=True),
                                                   'experience': SimpleSerializer(Experience)(many=True, read_only=True),
                                                   })
class JobSeekerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobSeekerPermission)
    serializer_class = JobSeekerSerializer
    def get_queryset(self):
        job = self.request.QUERY_PARAMS.get('job')
        if job:
            job = Job.objects.select_related('sector', 'contract', 'hours').get(pk=self.request.QUERY_PARAMS['job'])
            query = JobSeeker.objects.exclude(applications__job=job)
            exclude_pks = self.request.QUERY_PARAMS.get('exclude')
            if exclude_pks:
                query = query.exclude(pk__in=map(int, exclude_pks.split(',')))
            query = query.filter(Q(profile__contract=job.contract) | Q(profile__contract=None),
                                 Q(profile__hours=job.hours) | Q(profile__hours=None),
                                 profile__sectors=job.sector,
                                 )
            # TODO location
            return query[:25]
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
    serializer_class = JobProfileSerializer
router.register('job-profiles', JobProfileViewSet)


class JobPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            request.user.job_seeker
        except JobSeeker.DoesNotExist:
            return False
        return True
class JobViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated, JobPermission)
    serializer_class = SimpleSerializer(Job, {'location_data': LocationSerializer(source='location', read_only=True),
                                              'business_data': BusinessSerializer(source='location.business', read_only=True),
                                              })
    def get_queryset(self):
        job_seeker = self.request.user.job_seeker
        job_profile = job_seeker.profile
        query = Job.objects.exclude(applications__job_seeker=job_seeker)
        exclude_pks = self.request.QUERY_PARAMS.get('exclude')
        if exclude_pks:
            query = query.exclude(pk__in=map(int, exclude_pks.split(',')))
        if job_profile.contract_id:
            query = query.filter(contract=job_profile.contract)
        if job_profile.hours_id:
             query = query.filter(hours=job_profile.hours)
        query = query.filter(sector__in=job_profile.sectors.all())
        # TODO location
        return query
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
router.register('jobs', JobViewSet, base_name='jobs')

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
    serializer_class = SimpleSerializer(Application, {'job_seeker': JobSeekerSerializer(read_only=True),
                                                      'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                      'deleted_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                      })
    create_serializer_class = SimpleSerializer(Application, {'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
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
        if self.request.method == 'POST':
            return self.create_serializer_class
        return self.serializer_class
    
    def get_queryset(self):
        job = self.request.QUERY_PARAMS.get('job')
        if job:
            shortlisted = self.request.QUERY_PARAMS.get('shortlisted')
            if shortlisted == '1':
                return Application.objects.filter(job__pk=job, shortlisted=True)
            else:
                return Application.objects.filter(job__pk=job)
        return Application.objects.all()
        
router.register('applications', ApplicationViewSet)
