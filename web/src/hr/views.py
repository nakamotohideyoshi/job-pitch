from rest_framework import viewsets, permissions
from rest_framework.routers import DefaultRouter

from hr.models import Job, Employee
from hr.permissions import HRPermission
from hr.serializers import JobSerializer, EmployeeSerializer


class JobViewSet(viewsets.ModelViewSet):
    class JobPermission(HRPermission):
        def get_business(self, job):
            return job.location.business

    permission_classes = (permissions.IsAuthenticated, JobPermission)
    serializer_class = JobSerializer
    queryset = Job.objects.all()

    def get_queryset(self):
        return super(JobViewSet, self).get_queryset().filter(location__business__users=self.request.user)


class EmployeeViewSet(viewsets.ModelViewSet):
    class EmployeePermission(HRPermission):
        def get_business(self, employee):
            return employee.job.location.business

    permission_classes = (permissions.IsAuthenticated, EmployeePermission)
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.all()

    def get_queryset(self):
        return super(EmployeeViewSet, self).get_queryset().filter(job__location__business__users=self.request.user)


router = DefaultRouter()
router.register('jobs', JobViewSet, base_name='jobs')
router.register('employees', EmployeeViewSet, base_name='employees')
