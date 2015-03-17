from django.contrib.auth.models import User
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Availability, Business, Location,\
    JobStatus, Job, Sex, Nationality, JobSeeker, Experience, JobProfile,\
    ApplicationStatus, Application, Role


router = DefaultRouter()

def SimpleSerializer(m,  overrides={}):
    class Meta:
        model = m
    fields = {'Meta': Meta}
    fields.update(overrides)
    return type(str("%sSerializer" % m._meta.object_name),
                (serializers.ModelSerializer,),
                fields,
                )

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

def business_perform_create(self, serializer):
    serializer.save().users.add(self.request.user)
class BusinessPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.users.filter(pk=int(request.user.pk)).exists()
BusinessViewSet = SimpleModelViewSet(Business,
                                     permissions=(permissions.IsAuthenticated, BusinessPermission),
                                     overrides={'perform_create': business_perform_create},
                                     serializer_overrides={'users': serializers.PrimaryKeyRelatedField(many=True, read_only=True)},
                                     )

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
LocationViewSet = SimpleModelViewSet(Location, permissions=(permissions.IsAuthenticated, LocationPermission))

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
JobViewSet = SimpleModelViewSet(Job, permissions=(permissions.IsAuthenticated, JobPermission))

def job_seeker_perform_create(self, serializer):
    serializer.save(user=self.request.user)
class JobSeekerPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
JobSeekerViewSet = SimpleModelViewSet(JobSeeker,
                                      permissions=(permissions.IsAuthenticated, JobSeekerPermission),
                                      overrides={'perform_create': job_seeker_perform_create},
                                      serializer_overrides={'user': serializers.PrimaryKeyRelatedField(read_only=True)},
                                      )

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
ExperienceViewSet = SimpleModelViewSet(Experience, permissions=(permissions.IsAuthenticated, ExperiencePermission))

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
JobProfileViewSet = SimpleModelViewSet(JobProfile, permissions=(permissions.IsAuthenticated, JobSeekerPermission))

def application_perform_create(self, serializer):
    job = Job.objects.get(pk=self.request.data['job'])
    if self.request.user.businesses.filter(locations__jobs=job).exists():
        role = Role.objects.get(name='RECRUITER')
    else:
        role = Role.objects.get(name='JOB_SEEKER')
    serializer.save(created_by=role)
ApplicationSerializerForUpdate = SimpleSerializer(Application,
                                                  overrides={'job_seeker': serializers.PrimaryKeyRelatedField(read_only=True),
                                                             'job': serializers.PrimaryKeyRelatedField(read_only=True),
                                                             'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                             'deleted_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                             })
def application_get_serializer_class(self):
    if self.request.method == 'PUT':
        return ApplicationSerializerForUpdate
    return self.serializer_class
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
ApplicationViewSet = SimpleModelViewSet(Application,
                                        overrides={'perform_create': application_perform_create,
                                                   'get_serializer_class': application_get_serializer_class,
                                                   },
                                        serializer_overrides={'created_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                              'deleted_by': serializers.PrimaryKeyRelatedField(read_only=True),
                                                              },
                                        permissions=(permissions.IsAuthenticated, ApplicationPermission),
                                        )

def api_token_auth_test(request):
    return render_to_response('api_token_auth_test.html', {}, context_instance=RequestContext(request))
