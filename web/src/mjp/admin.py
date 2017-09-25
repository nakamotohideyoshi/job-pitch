from django.conf.urls import url
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.core.validators import EMPTY_VALUES, EmailValidator
from django.db.models import Case, BooleanField
from django.db.models import Count, Max
from django.db.models import F
from django.db.models import Q
from django.db.models import Value
from django.db.models import When
from django.db.models.functions import Concat
from django.db.models.aggregates import Aggregate
from django.forms import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from .models import (
    Sex,
    Nationality,
    Contract,
    Hours,
    Sector,
    Business,
    JobSeeker,
    User,
    Message,
    EmailTemplate,
    TokenStore,
    InitialTokens,
    ProductTokens,
    PayPalProduct,
    Pitch,
    Role,
    JobProfile,
)


@admin.register(Sex, Nationality, Contract, Hours, Business, Message)
class Admin(admin.ModelAdmin):
    pass


class PitchInline(admin.StackedInline):
    model = Pitch
    verbose_name_plural = 'Pitch'
    max_num = 0


class JobProfileInline(admin.StackedInline):
    model = JobProfile
    verbose_name_plural = 'Profile'
    max_num = 0
    readonly_fields = ('place_id', 'place_name', 'postcode_lookup')


class ProfileFilter(admin.SimpleListFilter):

    model = None
    filter_kwarg = None

    def queryset(self, request, queryset):
        pk = self.value()
        if pk:
            return queryset.filter(**{self.filter_kwarg: pk})

    def lookups(self, request, model_admin):
        return [(obj.id, obj.name) for obj in self.model.objects.all()]


class ProfileShortNameFilter(ProfileFilter):
    def lookups(self, request, model_admin):
        return [(obj.id, "{} ({})".format(obj.name, obj.short_name)) for obj in self.model.objects.all()]


class StringAggregate(Aggregate):
    function = 'string_agg'
    name = 'String Aggregate'
    template = '%(function)s(%(distinct)s%(expressions)s)'

    def __init__(self, *expressions, **extra):
        distinct = 'DISTINCT ' if extra.pop('distinct', False) else ''
        super(StringAggregate, self).__init__(*expressions, distinct=distinct, **extra)


class SectorFilter(ProfileFilter):
    model = Sector
    filter_kwarg = 'profile__sectors__pk'
    title = 'Sector'
    parameter_name = 'sector'


class HoursFilter(ProfileShortNameFilter):
    model = Hours
    filter_kwarg = 'profile__hours__pk'
    title = 'Hours'
    parameter_name = 'hours'


class ContractFilter(ProfileShortNameFilter):
    model = Contract
    filter_kwarg = 'profile__contracts__pk'
    title = 'Contracts'
    parameter_name = 'contracts'


class SexFilter(ProfileShortNameFilter):
    model = Sex
    filter_kwarg = 'sex__pk'
    title = 'Sex'
    parameter_name = 'sex'


@admin.register(JobSeeker)
class JobSeekerAdmin(admin.ModelAdmin):
    fields = (
        'active',
        'first_name',
        'last_name',
        ('get_email', 'email_public'),
        ('age', 'age_public'),
        ('sex', 'sex_public'),
        ('nationality', 'nationality_public'),
        ('telephone', 'telephone_public'),
        ('mobile', 'mobile_public'),
        'get_sector_list',
        'get_hours_list',
        'get_contract_list',
        'get_sex',
        'description',
        'cv',
        'has_references',
        'truth_confirmation',
    )
    readonly_fields = ('get_email',)
    list_display = (
        'get_email',
        'get_full_name',
        'age',
        'get_sex',
        'get_sector_list',
        'get_hours_list',
        'get_contract_list',
        'get_search_area',
        'has_pitch',
        'get_last_login',
        'latest_application',
        'get_date_joined',
        'active',
    )
    list_filter = (SectorFilter, ContractFilter, HoursFilter, SexFilter)
    search_fields = ('user__email', 'first_name', 'last_name')

    def get_fields(self, request, obj=None):
        fields = super(JobSeekerAdmin, self).get_fields(request, obj)
        return tuple(field for field in fields if field not in (
            'get_sector_list',
            'get_hours_list',
            'get_contract_list',
            'get_sex',
        ))

    inlines = (
        PitchInline,
        JobProfileInline,
    )

    def get_queryset(self, request):
        queryset = super(JobSeekerAdmin, self).get_queryset(request)
        queryset = queryset.distinct()
        queryset = queryset.select_related('profile')
        queryset = queryset.prefetch_related('pitches', 'applications')
        queryset = queryset.annotate(
            email=F('user__email'),
            sector_list=StringAggregate('profile__sectors__name', Value(', '), distinct=True),
            contract_list=StringAggregate('profile__contract__short_name', Value(', '), distinct=True),
            hours_list=StringAggregate('profile__hours__short_name', Value(', '), distinct=True),
            full_name=Concat('first_name', Value(' '), 'last_name'),
            latest_application=Max(
                Case(When(applications__created_by__name=Role.JOB_SEEKER, then=F('applications__created'))),
            ),
            pitch_count=Count('pitches'),
            sex_short_name=F('sex__short_name'),
        )
        queryset = queryset.annotate(
            has_pitch=Case(When(pitch_count__gt=0, then=True), default=False, output_field=BooleanField()),
        )
        return queryset

    def get_full_name(self, job_seeker):
        return job_seeker.full_name
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'full_name'

    def get_email(self, job_seeker):
        return job_seeker.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'email'

    def get_sex(self, job_seeker):
        return job_seeker.sex_short_name
    get_sex.short_description = 'Sex'
    get_sex.admin_order_field = 'sex_short_name'

    def get_search_area(self, job_seeker):
        profile = job_seeker.profile
        return u"{} ({} miles)".format(
            profile.place_name or profile.postcode_lookup or profile.latlng,
            profile.search_radius,
        )
    get_search_area.short_description = 'Search Area'

    def get_date_joined(self, jobseeker):
        return jobseeker.user.date_joined
    get_date_joined.short_description = 'Joined'
    get_date_joined.admin_order_field = 'user__date_joined'

    def get_last_login(self, jobseeker):
        return jobseeker.user.last_login
    get_last_login.short_description = 'Last Login'
    get_last_login.admin_order_field = 'user__last_login'

    def has_pitch(self, job_seeker):
        return job_seeker.has_pitch
    has_pitch.boolean = True
    has_pitch.admin_order_field = 'has_pitch'

    def latest_application(self, job_seeker):
        return job_seeker.latest_application
    latest_application.admin_order_field = 'latest_application'

    def get_sector_list(self, job_seeker):
        return job_seeker.sector_list
    get_sector_list.short_description = 'Sectors'
    get_sector_list.admin_order_field = 'sector_list'

    def get_hours_list(self, job_seeker):
        return job_seeker.hours_list
    get_hours_list.short_description = 'Hours'
    get_hours_list.admin_order_field = 'hours_list'

    def get_contract_list(self, job_seeker):
        return job_seeker.contract_list
    get_contract_list.short_description = 'Contracts'
    get_contract_list.admin_order_field = 'contract_list'


class CommaSeparatedEmailField(forms.Field):
    description = u"E-mail address(es)"

    def __init__(self, *args, **kwargs):
        self.token = kwargs.pop("token", ",")
        super(CommaSeparatedEmailField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        if value in EMPTY_VALUES:
            return []

        value = [item.strip() for item in value.split(self.token) if item.strip()]

        return list(set(value))

    def clean(self, value):
        """
        Check that the field contains one or more 'comma-separated' emails
        and normalizes the data to a list of the email strings.
        """
        value = self.to_python(value)

        if value in EMPTY_VALUES and self.required:
            raise forms.ValidationError(u"This field is required.")

        for email in value:
            EmailValidator(message="Please enter valid email addresses.")(email)
        return value


class BulkRegisterForm(forms.Form):
    emails = CommaSeparatedEmailField(token='\n', required=True)


class PreRegistrationPasswordResetForm(PasswordResetForm):
    def get_users(self, email):
        return get_user_model()._default_manager.filter(
            email__iexact=email,
            is_active=True,
        )


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fields = (
        'email',
        'first_name',
        'last_name',
        'date_joined',
        'last_login',
        'is_active',
        'is_staff',
        'is_superuser',
        'groups',
        'user_permissions',
    )
    readonly_fields = ('last_login', 'date_joined')
    list_display = ('email', 'last_login', 'date_joined', 'is_active', 'is_staff')

    def get_urls(self):
        return [
            url(r'bulk-register/$', self.admin_site.admin_view(self.bulk_register)),
        ] + super(UserAdmin, self).get_urls()

    def bulk_register(self, request, *args, **kwargs):
        if request.method == 'POST':
            form = BulkRegisterForm(data=request.POST)
            if form.is_valid():
                sent = []
                skipped = []
                for email in form.cleaned_data['emails']:
                    user, created = get_user_model().objects.get_or_create(email=email)
                    if created:
                        reset_form = PreRegistrationPasswordResetForm(data={'email': email})
                        reset_form.is_valid()
                        reset_form.save(
                            subject_template_name='admin/mjp/user/buik_register_email_subject.txt',
                            email_template_name='admin/mjp/user/buik_register_email.txt',
                        )
                        sent.append(email)
                    else:
                        skipped.append(email)
                if sent:
                    messages.success(
                        request,
                        'Registration emails sent to the following addresses: {}'.format("; ".join(sent)),
                    )
                if skipped:
                    messages.warning(
                        request,
                        'Skipped the following addresses (already registered): {}'.format("; ".join(skipped)),
                    )
                return HttpResponseRedirect('.')
        else:
            form = BulkRegisterForm()
        return render_to_response(
            'admin/mjp/user/bulk_register.html',
            context_instance=RequestContext(request),
            context={
                'form': form,
                'opts': self.model._meta,
                'title': 'Bulk register',
            },
        )


@admin.register(InitialTokens)
class InitialTokens(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    exclude = ('name',)
    readonly_fields = ('context_help',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class BusinessInline(admin.TabularInline):
    model = Business
    fields = ('name',)
    readonly_fields = ('name',)
    can_delete = False
    extra = 0

    def has_add_permission(self, request):
        return False


@admin.register(TokenStore)
class TokenStoreAdmin(admin.ModelAdmin):
    fields = ('tokens', 'user',)
    readonly_fields = ('user',)
    list_display = ('tokens', 'user', 'business_list',)

    inlines = [
        BusinessInline,
    ]

    def get_queryset(self, request):
        query = super(TokenStoreAdmin, self).get_queryset(request)
        query = query.prefetch_related('businesses')
        return query

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ProductTokens)
class ProductTokensAdmin(admin.ModelAdmin):
    list_display = ('sku', 'tokens',)


@admin.register(PayPalProduct)
class ProductTokensAdmin(admin.ModelAdmin):
    list_display = ('product_code', 'tokens',)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name', 'priority',)
