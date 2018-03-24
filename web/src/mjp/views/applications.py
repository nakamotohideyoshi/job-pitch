from django.db.models import Max
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from mjp.models import Job, Role, ApplicationStatus, Message, Application
from mjp.serializers.applications import ApplicationSerializer, ApplicationCreateSerializer, \
    ApplicationConnectSerializer, ApplicationShortlistUpdateSerializer, MessageCreateSerializer, MessageUpdateSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    class ApplicationPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            pk = request.data.get('job')
            if pk:
                job = Job.objects.get(pk=pk)
                is_recruiter = request.user.businesses.filter(locations__jobs=job).exists()
                if not is_recruiter and not request.user.is_job_seeker:
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

    def perform_create(self, serializer):
        job = Job.objects.get(pk=self.request.data['job'])
        role = self.request.user.role
        if role.name == Role.RECRUITER:
            status = ApplicationStatus.objects.get(name='ESTABLISHED')
        else:
            status = ApplicationStatus.objects.get(name='CREATED')
        application = serializer.save(created_by=role, status=status)
        message = Message()
        message.system = True
        message.application = application
        message.from_role = role
        if role.name == Role.RECRUITER:
            message.content = \
                '%(business)s has expressed an interest in your profile for the following job:\n' \
                'Job title: %(title)s\n' \
                'Sector: %(sector)s\n' \
                'Contract: %(contract)s\n' \
                'Hours: %(hours)s\n' \
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
        role = self.request.user.role
        application.deleted_by = role
        application.save()
        message = Message()
        message.system = True
        message.application = application
        message.from_role = role
        if role.name == Role.RECRUITER:
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
            raise PermissionDenied()
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
                                       'job__location__business_users',
                                       'job__location__business__images',
                                       'job__location__business__users',
                                       )
        if self.request.user.role.name == Role.RECRUITER:
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

