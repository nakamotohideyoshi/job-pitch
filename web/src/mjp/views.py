from rest_framework import viewsets, permissions, serializers
from rest_framework.routers import DefaultRouter

from mjp.models import Sector, Hours, Contract, Availability, Business, Location,\
    JobStatus, Job, Sex, Nationality, JobSeeker, Experience, JobProfile,\
    ApplicationStatus, Application, Role

router = DefaultRouter()

def SimpleSerializer(m):
    class Meta:
        model = m
    return type(str("%sSerializer" % m._meta.model_name),
                (serializers.ModelSerializer,),
                {'Meta': Meta},
                )

def SimpleReadOnlyViewSet(model, permissions=(permissions.IsAuthenticated,)):
    cls = type(str('%sViewSet' % model._meta.model_name),
               (viewsets.ReadOnlyModelViewSet,),
               {'queryset': model.objects.all(),
                'serializer_class':  SimpleSerializer(model),
                'permission_classes': permissions,
                })
    router.register(model._meta.verbose_name_plural.lower().replace(' ', '-'), cls)
    return cls

SectorViewSet = SimpleReadOnlyViewSet(Sector)
ContractViewSet = SimpleReadOnlyViewSet(Contract)
HoursViewSet = SimpleReadOnlyViewSet(Hours)
AvailabilityViewSet = SimpleReadOnlyViewSet(Availability)
BusinessViewSet = SimpleReadOnlyViewSet(Business)
LocationViewSet = SimpleReadOnlyViewSet(Location)
JobStatusViewSet = SimpleReadOnlyViewSet(JobStatus)
JobViewSet = SimpleReadOnlyViewSet(Job)
SexViewSet = SimpleReadOnlyViewSet(Sex)
NationalityViewSet = SimpleReadOnlyViewSet(Nationality)
JobSeekerViewSet = SimpleReadOnlyViewSet(JobSeeker)
ExperienceViewSet = SimpleReadOnlyViewSet(Experience)
JobProfileViewSet = SimpleReadOnlyViewSet(JobProfile)
ApplicationStatusViewSet = SimpleReadOnlyViewSet(ApplicationStatus)
RoleViewSet = SimpleReadOnlyViewSet(Role)
ApplicationViewSet = SimpleReadOnlyViewSet(Application)
