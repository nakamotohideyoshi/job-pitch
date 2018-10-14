from django.contrib.auth.forms import PasswordResetForm
from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from mjp.models import (
    BusinessUser,
    BusinessImage,
    TokenStore,
    InitialTokens,
    Business,
    LocationImage,
    Location,
    JobImage,
    Job,
    JobVideo,
    Application,
)
from mjp.serializers.recruiter import (
    BusinessImageSerializer,
    LocationImageSerializer,
    JobImageSerializer,
    JobVideoSerializer,
    BusinessUserSerializer,
    BusinessUserCreateSerializer,
    BusinessUserUpdateSerializer,
    ExclusionSerializer,
    UserBusinessSerializerV1,
    UserBusinessSerializer,
    UserLocationSerializerV1,
    UserLocationSerializerV5,
    UserLocationSerializer,
    UserJobSerializerV1,
    UserJobSerializerV2,
    UserJobSerializerV5,
    UserJobSerializer,
)


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
            business_user = obj.business_users.get(user=request.user)
            if business_user.locations.exists():
                return False
            if request.method == 'DELETE':
                return request.user.can_create_businesses and obj.users.filter(pk=int(request.user.pk)).exists()
            return obj.users.filter(pk=int(request.user.pk)).exists()

    permission_classes = (permissions.IsAuthenticated, BusinessPermission)

    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1
        if version >= 5:
            return UserBusinessSerializer
        return UserBusinessSerializerV1

    def perform_create(self, serializer):
        token_store = TokenStore.objects.create(
            tokens=InitialTokens.objects.get().tokens,
            user=self.request.user,
        )
        business = serializer.save(token_store=token_store)
        BusinessUser.objects.create(business=business, user=self.request.user)

    def get_queryset(self):
        return Business.objects.filter(users=self.request.user)


class UserBusinessImageViewSet(viewsets.ModelViewSet):
    class UserBusinessImagePermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            try:
                business_user = obj.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                return False
            return True

    def get_queryset(self):
        return super(UserBusinessImageViewSet, self).get_queryset().filter(business__users=self.request.user)

    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.business.images.exclude(pk=image.pk).delete()

    permission_classes = (permissions.IsAuthenticated, UserBusinessImagePermission,)
    serializer_class = BusinessImageSerializer
    queryset = BusinessImage.objects.all()


class UserLocationViewSet(viewsets.ModelViewSet):
    class LocationPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.is_recruiter

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            try:
                business_user = obj.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                if request.method == 'DELETE':
                    return False
                return business_user.locations.filter(pk=obj.pk).exists()
            return True

    permission_classes = (permissions.IsAuthenticated, LocationPermission)

    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1
        if version >= 6:
            return UserLocationSerializer
        if version >= 5:
            return UserLocationSerializerV5
        return UserLocationSerializerV1

    def get_queryset(self):
        business = self.request.query_params.get('business', None)
        query = Location.objects.distinct().filter(
            (
                    Q(business__business_users__user=self.request.user) &
                    Q(business__business_users__locations__isnull=True)
            ) | Q(business_users__user=self.request.user)
        )
        if business:
            return query.filter(business__id=business)
        return query


class UserLocationImageViewSet(viewsets.ModelViewSet):
    class UserLocationImagePermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            try:
                business_user = obj.location.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                return business_user.locations.filter(pk=obj.location.pk).exists()
            return True

    def get_queryset(self):
        return super(UserLocationImageViewSet, self).get_queryset().filter(location__business__users=self.request.user)

    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.location.images.exclude(pk=image.pk).delete()

    permission_classes = (permissions.IsAuthenticated, UserLocationImagePermission,)
    serializer_class = LocationImageSerializer
    queryset = LocationImage.objects.all()


class UserJobViewSet(viewsets.ModelViewSet):
    class UserJobPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.is_recruiter

        def has_object_permission(self, request, view, obj):
            if request.method in permissions.SAFE_METHODS:
                return True
            try:
                business_user = obj.location.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                return business_user.locations.filter(adverts__pk=obj.pk).exists()
            return True

    permission_classes = (permissions.IsAuthenticated, UserJobPermission)

    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1
        if version >= 6:
            return UserJobSerializer
        if version >= 5:
            return UserJobSerializerV5
        if version >= 2:
            return UserJobSerializerV2
        return UserJobSerializerV1

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        query = Job.objects.distinct().filter(
            (
                    Q(location__business__business_users__user=self.request.user) &
                    Q(location__business__business_users__locations__isnull=True)
            ) | Q(location__business_users__user=self.request.user)
        )
        if location:
            return query.filter(location__id=location)
        return query

    @detail_route(methods=['POST'])
    def exclude(self, request, pk):
        with transaction.atomic():
            job = self.get_object()
            serializer = ExclusionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            if Application.objects.filter(job=job, job_seeker=serializer.validated_data['job_seeker']).exists():
                raise serializers.ValidationError({'job_seeker': 'Application already exists'})
            if job.exclusions.filter(job_seeker=serializer.validated_data['job_seeker']).exists():
                raise serializers.ValidationError({'job_seeker': 'Job seeker already excluded'})
            serializer.save(
                job=job,
            )
        return Response(dict(serializer.data))  # convert to dict to prevent browsable API breaking


class UserJobImageViewSet(viewsets.ModelViewSet):
    class UserJobImagePermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            try:
                business_user = obj.job.location.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                return business_user.locations.filter(adverts__pk=obj.location.pk).exists()
            return True

    def get_queryset(self):
        return super(UserJobImageViewSet, self).get_queryset().filter(job__location__business__users=self.request.user)

    def perform_create(self, serializer):
        image = serializer.save()
        # for now, allow only one image
        image.job.images.exclude(pk=image.pk).delete()

    permission_classes = (permissions.IsAuthenticated, UserJobImagePermission,)
    serializer_class = JobImageSerializer
    queryset = JobImage.objects.all()


class JobVideoViewSet(viewsets.ModelViewSet):
    class JobVideoPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.user and request.user.is_authenticated():
                if request.method in permissions.SAFE_METHODS:
                    return True
                return request.user.businesses.exists()
            if request.user.is_anonymous() and request.method in ('GET', 'PATCH'):
                return True
            return False

        def has_object_permission(self, request, view, obj):
            if request.user and request.user.is_authenticated():
                return request.user.businesses.filter(pk=obj.job.location.business_id).exists()
            if request.user.is_anonymous() and request.method in ('GET', 'PATCH'):
                return request.GET.get('token') == obj.token
            return False

    def get_queryset(self):
        query = super(JobVideoViewSet, self).get_queryset()
        if self.request.user.is_authenticated():
            return query.filter(job__location__business__users=self.request.user)
        if self.request.user.is_anonymous() and self.request.method in ('GET', 'PATCH'):
            return query.filter(token=self.request.GET.get('token'))

    def perform_create(self, serializer):
        job = serializer.validated_data['job']
        if not self.request.user.businesses.filter(pk=job.location.business.pk).exists():
            raise serializers.ValidationError({'job': 'does not exist'})
        video = serializer.save()
        if video.video is None:
            # delete any other uploads
            JobVideo.objects.filter(job=job, video=None).exclude(pk=video.pk).delete()
        else:
            # delete any pitch except this one
            JobVideo.objects.filter(job=job).exclude(pk=video.pk).delete()

    def perform_update(self, serializer):
        video = serializer.save()
        job = video.job
        if video.video is None:
            # delete any other uploads
            JobVideo.objects.filter(job=job, video=None).exclude(pk=video.pk).delete()
        else:
            # delete any pitch except this one
            JobVideo.objects.filter(job=job).exclude(pk=video.pk).delete()

    permission_classes = (JobVideoPermission,)
    serializer_class = JobVideoSerializer
    queryset = JobVideo.objects.all()


class BusinessUserViewSet(viewsets.ModelViewSet):
    class BusinessUserPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.user and request.user.is_authenticated() and request.user.is_recruiter:
                try:
                    business = Business.objects.get(pk=view.kwargs['business_pk'])
                except Business.DoesNotExist:
                    return False
                try:
                    business_user = business.business_users.get(user=request.user)
                except BusinessUser.DoesNotExist:
                    return False
                return not business_user.locations.exists()
            return False

        def has_object_permission(self, request, view, obj):
            if request.user and request.user.is_authenticated():
                if request.user == obj.user:
                    return False
                try:
                    business_user = obj.business.business_users.get(user=request.user)
                except BusinessUser.DoesNotExist:
                    return False
                return not business_user.locations.exists()
            return False

    serializer_class = BusinessUserSerializer
    queryset = BusinessUser.objects.all()
    permission_classes = (BusinessUserPermission,)

    @detail_route(methods=['POST'], url_path='resend-invitation')
    def resend_invitation(self, request, business_pk, pk):
        self._send_email(self.get_object(), False)
        return Response({"result": "success"})

    def perform_create(self, serializer):
        business_user = serializer.save()
        created = serializer.new_user
        self._send_email(business_user, created)

    def _send_email(self, business_user, created):
        if created:
            template = 'registration/invitation_email_new_user.txt'
        else:
            template = 'registration/invitation_email_existing_user.txt'
        reset_form = PasswordResetForm(data={'email': business_user.user.email})
        if not reset_form.is_valid():
            raise serializers.ValidationError('Error sending invitation')
        reset_form.save(
            use_https=self.request.is_secure(),
            request=self.request,
            subject_template_name='registration/invitation_subject.txt',
            email_template_name=template,
            extra_email_context={
                'business_user': business_user,
            }
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BusinessUserCreateSerializer
        if self.request.method == 'PUT':
            return BusinessUserUpdateSerializer
        return super(BusinessUserViewSet, self).get_serializer_class()

    def get_serializer_context(self):
        context = super(BusinessUserViewSet, self).get_serializer_context()
        if self.request.method == 'POST':
            context['business'] = Business.objects.get(pk=self.kwargs['business_pk'])
        return context

    def get_queryset(self):
        query = super(BusinessUserViewSet, self).get_queryset()
        query = query.filter(
            business__pk=self.kwargs['business_pk'],
            business__business_users__user=self.request.user,
            business__business_users__locations__isnull=True,
        )
        return query
