from django.contrib.auth.models import User
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Availability, Business, Location,\
    JobStatus, Job, Sex, Nationality, JobSeeker, Experience, JobProfile,\
    ApplicationStatus, Application, Role
from rest_framework.mixins import CreateModelMixin


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
        return request.user.businesses.filter(locations__job=obj).exists()
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

ExperienceViewSet = SimpleModelViewSet(Experience)
JobProfileViewSet = SimpleModelViewSet(JobProfile)
ApplicationViewSet = SimpleModelViewSet(Application)

def api_token_auth_test(request):
    return render_to_response('api_token_auth_test.html', {}, context_instance=RequestContext(request))
