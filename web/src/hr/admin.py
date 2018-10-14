from django.contrib import admin
from django.core.urlresolvers import reverse
from django.db.models import F, Value
from django.db.models.functions import Concat
from django.utils.html import format_html

from hr.models import Employee, Job
from mjp.admin import SexFilter


class EmployeeInline(admin.TabularInline):
    model = Employee
    fields = ('get_name', 'get_location',)
    readonly_fields = ('get_name', 'get_location',)
    extra = 0

    def get_name(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:hr_employee_change', args=(obj.id,)),
            obj.get_full_name(),
        ))
    get_name.short_description = 'Name'

    def get_location(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_location_change', args=(obj.id,)),
            obj.job.location.name,
        ))
    get_location.short_description = 'Workplace'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    fields = (
        'get_business',
        'get_location',
        'title',
        'description',
    )
    list_display = ('title', 'get_business', 'get_location', 'get_employee_count')
    readonly_fields = (
        'get_business',
        'get_location',
    )
    inlines = (EmployeeInline,)

    def get_queryset(self, request):
        queryset = super(JobAdmin, self).get_queryset(request)
        queryset = queryset.select_related('location__business')
        return queryset

    def get_business(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_business_change', args=(obj.location.business.pk,)),
            obj.location.business.name,
        ))
    get_business.short_description = 'Business'

    def get_location(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_location_change', args=(obj.location.pk,)),
            obj.location.name,
        ))
    get_location.short_description = 'Location'

    def get_employee_count(self, obj):
        return Employee.objects.filter(job=obj).count()
    get_employee_count.short_description = 'Employees'


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    fields = (
        'get_business',
        'get_location',
        'get_job',
        'get_email',
        'first_name',
        'last_name',
        'telephone',
        'sex',
        'nationality',
        'birthday',
        'national_insurance_number',
        'profile_image',
        'profile_thumb',
    )
    readonly_fields = ('get_business', 'get_location', 'get_job', 'profile_thumb', 'get_email')
    list_display = ('get_full_name', 'get_business', 'get_location', 'get_job', 'get_sex', 'get_email', 'created')
    list_filter = (SexFilter,)
    search_fields = ('first_name', 'last_name', 'email', 'job__title')

    def get_queryset(self, request):
        queryset = super(EmployeeAdmin, self).get_queryset(request)
        queryset = queryset.distinct()
        queryset = queryset.select_related('job__location__business')
        queryset = queryset.annotate(
            email=F('user__email'),
            full_name=Concat('first_name', Value(' '), 'last_name'),
            sex_short_name=F('sex__short_name'),
        )
        return queryset

    def get_email(self, obj):
        return obj.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'email'

    def get_sex(self, obj):
        return obj.sex_short_name
    get_sex.short_description = 'Sex'
    get_sex.admin_order_field = 'sex_short_name'

    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'full_name'

    def get_business(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_business_change', args=(obj.job.location.business.pk,)),
            obj.job.location.business.name,
        ))
    get_business.short_description = 'Business'

    def get_location(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_location_change', args=(obj.job.location.pk,)),
            obj.job.location.name,
        ))
    get_location.short_description = 'Location'

    def get_job(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:hr_job_change', args=(obj.job.pk,)),
            obj.job.location.name,
        ))
    get_job.short_description = 'Job'
