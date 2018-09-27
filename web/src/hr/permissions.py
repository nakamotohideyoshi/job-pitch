from rest_framework import permissions


class HRPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_recruiter

    def has_object_permission(self, request, view, obj):
        return request.user.owns_business(self.get_business(obj))

    def get_business(self, obj):
        raise NotImplementedError()
