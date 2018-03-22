from django.db.models import Q
from rest_framework import viewsets, permissions

from mjp.models import (
    BusinessUser,
    BusinessImage,
    TokenStore,
    InitialTokens,
    Business,
    LocationImage,
    Location,
    JobImage,
)
from mjp.serializers import (
    BusinessSerializer,
    LocationSerializer,
    JobSerializer,
)
from mjp.serializers.recruiter import BusinessImageSerializer, LocationImageSerializer, JobImageSerializer


class UserBusinessViewSet(viewsets.ModelViewSet):
    class BusinessPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method in ('POST', 'DELETE'):
                return request.user.can_create_businesses and request.user.is_recruiter
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
    serializer_class = BusinessSerializer

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
    serializer_class = LocationSerializer

    def get_queryset(self):
        business = self.request.query_params.get('business', None)
        query = Location.objects.filter(
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
                return business_user.locations.filter(job__pk=obj.pk).exists()
            return True

    permission_classes = (permissions.IsAuthenticated, UserJobPermission)
    serializer_class = JobSerializer

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        query = Location.objects.filter(
            (
                    Q(location__business__business_users__user=self.request.user) &
                    Q(location__business__business_users__locations__isnull=True)
            ) | Q(location__business_users__user=self.request.user)
        )
        if location:
            return query.filter(location__id=location)
        return query


class UserJobImageViewSet(viewsets.ModelViewSet):
    class UserJobImagePermission(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            try:
                business_user = obj.job.location.business.business_users.get(user=request.user)
            except BusinessUser.DoesNotExist:
                return False
            if business_user.locations.exists():
                return business_user.locations.filter(jobs__pk=obj.location.pk).exists()
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
