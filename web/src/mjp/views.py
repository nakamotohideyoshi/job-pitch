from django.db import transaction
from django.db.models import F, Q, Max
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from django.http import HttpResponse

from rest_framework import viewsets, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer

from mjp.models import (
    Sector,
    Hours,
    Contract,
    Business,
    Location,
    JobStatus,
    Job,
    Sex,
    Nationality,
    JobSeeker,
    JobProfile,
    ApplicationStatus,
    Application,
    Role,
    LocationImage,
    BusinessImage,
    JobImage,
    Message,
    Pitch,
    TokenStore,
    InitialTokens,
    AndroidPurchase,
)

from mjp.serializers import (
    SimpleSerializer,
    BusinessSerializer,
    LocationSerializer,
    JobProfileSerializer,
    JobSerializer,
    JobSeekerSerializer,
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationConnectSerializer,
    ApplicationShortlistUpdateSerializer,
    MessageCreateSerializer,
    MessageUpdateSerializer,
    PitchSerializer,
    AndroidPurchaseSerializer,
)

# For google APIs
from oauth2client.service_account import ServiceAccountCredentials
from httplib2 import Http
from apiclient.discovery import build
from apiclient.errors import HttpError


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


SectorViewSet = SimpleReadOnlyViewSet(Sector)
ContractViewSet = SimpleReadOnlyViewSet(Contract)
HoursViewSet = SimpleReadOnlyViewSet(Hours)
JobStatusViewSet = SimpleReadOnlyViewSet(JobStatus)
SexViewSet = SimpleReadOnlyViewSet(Sex)
NationalityViewSet = SimpleReadOnlyViewSet(Nationality)
ApplicationStatusViewSet = SimpleReadOnlyViewSet(ApplicationStatus)
RoleViewSet = SimpleReadOnlyViewSet(Role)


class UserBusinessImageViewSet(viewsets.ModelViewSet):
    class UserBusinessImagePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('business')
            print "business pk: %s" % pk
            if pk:
                return Business.objects.filter(pk=pk, users=request.user).exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.businesses.filter(pk=obj.business.pk).exists()
    
    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.business.images.exclude(pk=image.pk).delete()
        
    permission_classes = (permissions.IsAuthenticated, UserBusinessImagePermission,)
    serializer_class = SimpleSerializer(BusinessImage, {'thumbnail': serializers.ImageField(read_only=True)})
    queryset = BusinessImage.objects.all()
router.register('user-business-images', UserBusinessImageViewSet, base_name='user-business-image')


class BusinessViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BusinessSerializer
    queryset = Business.objects.all()
router.register('businesses', BusinessViewSet, base_name='business')


class UserBusinessViewSet(viewsets.ModelViewSet):
    class BusinessPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method in ('POST', 'DELETE'):
                return request.user.can_create_businesses or not request.user.businesses.exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method == 'DELETE':
                return request.user.can_create_businesses and obj.users.filter(pk=int(request.user.pk)).exists()
            return obj.users.filter(pk=int(request.user.pk)).exists()
    permission_classes = (permissions.IsAuthenticated, BusinessPermission)
    serializer_class = BusinessSerializer

    def perform_create(self, serializer):
        token_store = TokenStore.objects.create(
            tokens=InitialTokens.objects.get().tokens,
            user=self.request.user,
        )
        serializer.save(token_store=token_store).users.add(self.request.user)
        
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
    
    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.location.images.exclude(pk=image.pk).delete()
    
    permission_classes = (permissions.IsAuthenticated, UserLocationImagePermission,)
    serializer_class = SimpleSerializer(LocationImage, {'thumbnail': serializers.ImageField(read_only=True)})
    queryset = LocationImage.objects.all()
router.register('user-location-images', UserLocationImageViewSet, base_name='user-location-image')


class UserLocationViewSet(viewsets.ModelViewSet):
    class LocationPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('business')
            print "business pk: %s" % pk
            if pk:
                pk = int(pk)
                return Business.objects.filter(pk=pk, users__pk=int(request.user.pk)).exists()
            return True
        
        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.businesses.filter(locations=obj).exists()
    
    permission_classes = (permissions.IsAuthenticated, LocationPermission)
    serializer_class = LocationSerializer
    
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        print serializer.data
        return super(UserLocationViewSet, self).retrieve(request, pk)

    def get_queryset(self):
        business = self.request.query_params.get('business', None)
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


class UserJobImageViewSet(viewsets.ModelViewSet):
    class UserJobImagePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('job')
            print "job pk: %s" % pk
            if pk:
                return Job.objects.filter(pk=pk, location__business__users=request.user).exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.businesses.filter(locations__jobs=obj.job).exists()
        
    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.job.images.exclude(pk=image.pk).delete()
    
    permission_classes = (permissions.IsAuthenticated, UserJobImagePermission,)
    serializer_class = SimpleSerializer(JobImage, {'thumbnail': serializers.ImageField(read_only=True)})
    queryset = JobImage.objects.all()
router.register('user-job-images', UserJobImageViewSet, base_name='user-job-image')


class UserJobViewSet(viewsets.ModelViewSet):
    class UserJobPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            pk = request.query_params.get('location')
            if pk:
                return Location.objects.filter(pk=pk, business__users__pk=int(request.user.pk)).exists()
            return True

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.businesses.filter(locations__jobs=obj).exists()
    
    permission_classes = (permissions.IsAuthenticated, UserJobPermission)
    serializer_class = JobSerializer
    
    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        query = Job.objects.filter(location__business__users=self.request.user)
        if location:
            return query.filter(location__id=location)
        return query
router.register('user-jobs', UserJobViewSet, base_name='user-job')


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
    serializer_class = JobSeekerSerializer

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
            query = query.filter(distance__lte=F('profile__search_radius')*D(mi=1).m)
            return query[:25]
        return JobSeeker.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
router.register('job-seekers', JobSeekerViewSet, base_name='job-seeker')


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
            if request.user.is_anonymous() and request.method in ('GET', 'PUT'):
                return True
            return False
    
        def has_object_permission(self, request, view, obj):
            if request.user and request.user.is_authenticated():
                return obj.job_seeker == request.user.job_seeker
            if request.user.is_anonymous() and request.method in ('GET', 'PUT'):
                return request.GET.get('token') == obj.token
            return False
    
    def get_queryset(self):
        query = super(PitchViewSet, self).get_queryset()
        if self.request.user.is_authenticated():
            return query.filter(job_seeker=self.request.user.job_seeker)
        if self.request.user.is_anonymous() and self.request.method in ('GET', 'PUT'):
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
router.register('pitches', PitchViewSet, base_name='pitch')


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
router.register('job-profiles', JobProfileViewSet, base_name='job-profile')


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    class JobPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            try:
                request.user.job_seeker
            except JobSeeker.DoesNotExist:
                return False
            return True
    
    permission_classes = (permissions.IsAuthenticated, JobPermission)
    serializer_class = JobSerializer

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
        query = query.filter(status__name="OPEN")
        query = query.filter(location__latlng__distance_lte=(job_profile.latlng, D(mi=job_profile.search_radius)))
        return query
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
router.register('jobs', JobViewSet, base_name='jobs')


class ApplicationViewSet(viewsets.ModelViewSet):
    try:
        RECRUITER = Role.objects.get(name=Role.RECRUITER)
        JOB_SEEKER = Role.objects.get(name=Role.JOB_SEEKER)
    except:
        pass
    
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

        def has_object_permission(self, request, view, application):
            is_recruiter = request.user.businesses.filter(locations__jobs__applications=application).exists()
            is_job_seeker = application.job_seeker.user == request.user
            if is_recruiter or is_job_seeker:
                if request.method in permissions.SAFE_METHODS:
                    return True
                if request.method == 'DELETE' and application.status.name != 'DELETED':
                    return True
                if request.method == 'PUT':
                    return is_recruiter

    permission_classes = (permissions.IsAuthenticated, ApplicationPermission)
    serializer_class = ApplicationSerializer
    create_serializer_class = ApplicationCreateSerializer
    update_status_serializer_class = ApplicationConnectSerializer
    update_shortlist_serializer_class = ApplicationShortlistUpdateSerializer
    
    def get_role(self):
        if self.request.user.businesses.exists():
            return self.RECRUITER
        return self.JOB_SEEKER
    
    def perform_create(self, serializer):
        job = Job.objects.get(pk=self.request.data['job'])
        role = self.get_role()
        if role is self.RECRUITER:
            status = ApplicationStatus.objects.get(name='ESTABLISHED')
        else:
            status = ApplicationStatus.objects.get(name='CREATED')
        application = serializer.save(created_by=role, status=status)
        message = Message()
        message.system = True
        message.application = application
        message.from_role = role
        if role is self.RECRUITER:
            message.content = \
                '%(business)s has expressed an interest in your profile for the following job:\n'\
                'Job title: %(title)s\n'\
                'Sector: %(sector)s\n'\
                'Contract: %(contract)s\n'\
                'Hours: %(hours)s\n'\
                 % {'business': job.location.business.name,
                    'title': job.title,
                    'sector': job.sector.name,
                    'contract': job.contract.name,
                    'hours': job.hours.name,
                    }
        else:
            message.content = '%(name)s has expressed an interest in your job %(title)s, %(location)s, %(business)s' \
                 % {'name': application.job_seeker.get_full_name(),
                    'title': job.title,
                    'location': job.location.name,
                    'business': job.location.business.name,
                    }
        message.save()

    def perform_destroy(self, application):
        application.status = ApplicationStatus.objects.get(name='DELETED')
        role = self.get_role()
        application.deleted_by = role  
        application.save()
        message = Message()
        message.system = True
        message.application = application
        message.from_role = role
        if role is self.RECRUITER:
            message.content = 'The recruiter has withdrawn their interest'
        else:
            message.content = 'The job seeker has withdrawn their interest in this job'
        message.save()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.create_serializer_class
        if self.request.method == 'PUT':
            if self.request.data.get('shortlisted') is not None:
                return self.update_shortlist_serializer_class
            if self.request.data.get('connect') is not None:
                return self.update_status_serializer_class
        return self.serializer_class
    
    def get_queryset(self):
        query = Application.objects.annotate(Max('messages__created')).order_by('-messages__created__max', '-updated')
        query = query.select_related('job__location__business',
                                     'job_seeker__user',
                                     'job_seeker__profile__contract',
                                     'job_seeker__profile__hours',
                                     )
        query = query.prefetch_related('job_seeker__pitches',
                                       'messages',
                                       'job__location__jobs',
                                       'job__location__business__locations', 
                                       'job__images',
                                       'job__location__images',
                                       'job__location__business__images',
                                       'job__location__business__users',
                                       )
        if self.get_role() is self.RECRUITER:
            query = query.filter(job__location__business__users=self.request.user)
            job = self.request.query_params.get('job')
            if job:
                query = query.filter(job__pk=job)
                shortlisted = self.request.query_params.get('shortlisted')
                if shortlisted == '1':
                    query = query.filter(shortlisted=True)
                else:
                    query = query.order_by('-shortlisted')
                status = self.request.query_params.get('status')
                if status is not None:
                    query = query.filter(status__pk=status)
        else:
            query = query.filter(job_seeker__user=self.request.user)
        return query
router.register('applications', ApplicationViewSet, base_name='application')


class MessageViewSet(viewsets.ModelViewSet):
    class MessagePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method == 'POST':
                pk = request.data.get('application')
                if pk:
                    application = Application.objects.get(pk=int(pk))
                    is_recruiter = request.user.businesses.filter(locations__jobs__applications=application).exists()
                    return is_recruiter or application.job_seeker.user == request.user
                return True
            elif request.method == 'PUT':
                return True
            return False
        
        def has_object_permission(self, request, view, message):
            if request.method == 'PUT':
                is_recruiter = request.user.businesses.filter(locations__jobs__applications__messages=message).exists()
                if is_recruiter and message.from_role.name == Role.JOB_SEEKER:
                    return True
                is_job_seeker = message.application.job_seeker.user == request.user
                if is_job_seeker and message.from_role.name == Role.RECRUITER:
                    return True
            return False
        
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.serializer_class
        if self.request.method == 'PUT':
            return self.update_serializer_class
    
    def get_queryset(self):
        if self.request.method == 'PUT':
            return Message.objects.all()
        return Message.objects.none()
    
    def perform_create(self, serializer):
        application = Application.objects.get(pk=int(self.request.data.get('application')))
        if self.request.user.businesses.filter(locations__jobs__applications=application).exists():
            role = Role.objects.get(name=Role.RECRUITER)
        else:
            role = Role.objects.get(name=Role.JOB_SEEKER)
        serializer.save(from_role=role)
        
    permission_classes = (permissions.IsAuthenticated, MessagePermission)
    update_serializer_class = MessageUpdateSerializer
    serializer_class = MessageCreateSerializer
router.register('messages', MessageViewSet, base_name='message')


class AndroidPurchaseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = AndroidPurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        credentials = ServiceAccountCredentials.from_json_keyfile_name(
            '/web/mjp/keys/google-api.json', 
            ['https://www.googleapis.com/auth/androidpublisher']
        )
        http_auth = credentials.authorize(Http())
        service = build('androidpublisher', 'v2', http=http_auth)
        request = service.purchases().products().get(
            packageName='com.myjobpitch',
            productId=serializer.data['product_code'],
            token=serializer.data['purchase_token'],
        )

        try:
            response = request.execute()
        except HttpError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        with transaction.atomic():
            if not AndroidPurchase.objects.filter(purchase_token=serializer.data['purchase_token']).exists():
                token_store = TokenStore.objects.select_for_update().get(
                    businesses__pk=serializer.data['business_id'],
                )
                AndroidPurchase.objects.create(
                    product_code=serializer.data['product_code'],
                    purchase_token=serializer.data['purchase_token'],
                    token_store=token_store,
                )
                TokenStore.objects.filter(pk=token_store.pk).update(
                    tokens=F('tokens') + 20,
                )

        business = Business.objects.get(pk=serializer.data['business_id'])
        output_serializer = BusinessSerializer(business, context={
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        })
        return Response(output_serializer.data)

