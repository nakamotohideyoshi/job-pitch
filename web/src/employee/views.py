from rest_framework import viewsets, permissions
from rest_framework.routers import DefaultRouter

from hr.models import Employee
from employee.serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    class EmployeePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            return request.user.is_employee

        def has_object_permission(self, request, view, obj):
            return request.user.is_specific_employee(obj.id)

    permission_classes = (permissions.IsAuthenticated, EmployeePermission)
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.all()

    def get_queryset(self):
        return super(EmployeeViewSet, self).get_queryset().filter(user=self.request.user)


router = DefaultRouter()
router.register('employees', EmployeeViewSet, base_name='employees')
