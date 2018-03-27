from django.conf.urls import url
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.core.urlresolvers import reverse
from django.core.validators import EMPTY_VALUES, EmailValidator
from django.db.models import Case, BooleanField, Func, CharField
from django.db.models import Count, Max
from django.db.models import F
from django.db.models import Value
from django.db.models import When
from django.db.models.aggregates import Aggregate
from django.db.models.functions import Concat, Coalesce
from django.forms import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.html import format_html

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
    TokenStore,
    InitialTokens,
    ProductTokens,
    PayPalProduct,
    Pitch,
    Role,
    JobProfile,
    Location,
    Job,
    LocationImage,
    BusinessImage,
    JobImage,
    AppDeprecation,
    BusinessUser)


@admin.register(Sex, Nationality, Contract, Hours, Message)
class Admin(admin.ModelAdmin):
    pass


class ImageInline(admin.TabularInline):
    pass


class BusinessImageInline(ImageInline):
    model = BusinessImage


class LocationImageInline(ImageInline):
    model = LocationImage


class JobImageInline(ImageInline):
    model = JobImage


class UserInline(admin.TabularInline):
    model = BusinessUser
    extra = 0
    verbose_name_plural = 'Users'
    show_change_link = False
    fields = ('user', 'locations')
    readonly_fields = ('user',)

    def has_add_permission(self, request):
        return False

    def get_formset(self, request, obj=None, **kwargs):
        self._business = obj
        return super(UserInline, self).get_formset(request, obj, **kwargs)

    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        if db_field.name == "locations":
            kwargs["queryset"] = Location.objects.filter(business=self._business)
        return super(UserInline, self).formfield_for_manytomany(db_field, request, **kwargs)


class UserAddInline(admin.TabularInline):
    model = BusinessUser
    extra = 0
    verbose_name_plural = 'Add User'
    verbose_name = 'user association'

    def get_queryset(self, request):
        return super(UserAddInline, self).get_queryset(request).none()

    def has_delete_permission(self, request, obj=None):
        return False

    def get_formset(self, request, obj=None, **kwargs):
        self._business = obj
        return super(UserAddInline, self).get_formset(request, obj, **kwargs)

    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        if db_field.name == "locations":
            kwargs["queryset"] = Location.objects.filter(business=self._business)
        return super(UserAddInline, self).formfield_for_manytomany(db_field, request, **kwargs)


class LocationInline(admin.TabularInline):
    model = Location
    fields = ('get_name_link', 'get_location', 'email', 'telephone', 'mobile', 'created')
    readonly_fields = ('get_name_link', 'get_location', 'email', 'telephone', 'mobile', 'created')
    extra = 0

    def get_name_link(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_location_change', args=(obj.id,)),
            obj.name,
        ))
    get_name_link.short_description = 'Name'

    def get_location(self, obj):
        return obj.place_name or obj.postcode_lookup or obj.latlng
    get_location.short_description = 'Location'

    def has_add_permission(self, request):
        return False


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    fields = ('name', 'get_tokens')
    readonly_fields = ('get_tokens',)
    list_display = ('name', 'get_tokens', 'get_location_count', 'created')
    search_fields = ('name',)
    inlines = (BusinessImageInline, UserInline, UserAddInline, LocationInline)

    def get_queryset(self, request):
        queryset = super(BusinessAdmin, self).get_queryset(request)
        queryset = queryset.annotate(
            location_count=Count('locations'),
        )
        queryset = queryset.select_related('token_store')
        return queryset

    def get_tokens(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_tokenstore_change', args=(obj.token_store.pk,)),
            obj.token_store.tokens,
        ))
    get_tokens.short_description = 'Tokens'
    get_tokens.admin_order_field = 'token_store.tokens'

    def get_location_count(self, obj):
        return obj.location_count
    get_location_count.short_description = 'No. of Work Places'
    get_location_count.admin_order_field = 'location_count'

    class Media:
        css = {"all": ("css/business_admin_overrides.css",)}


class JobInline(admin.TabularInline):
    model = Job
    fields = (
        'get_name_link',
        'get_sector_name',
        'get_contract_name',
        'get_hours_name',
        'get_status_name',
        # 'created',
    )
    readonly_fields = (
        'get_name_link',
        'get_sector_name',
        'get_contract_name',
        'get_hours_name',
        'get_status_name',
        # 'created',
    )
    extra = 0

    def get_queryset(self, request):
        queryset = super(JobInline, self).get_queryset(request)
        queryset = queryset.annotate(
            sector_name=F('sector__name'),
            contract_name=F('contract__short_name'),
            hours_name=F('hours__short_name'),
            status_name=F('status__name'),
        )
        return queryset

    def has_add_permission(self, request):
        return False

    def get_name_link(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_job_change', args=(obj.id,)),
            obj.title,
        ))
    get_name_link.short_description = 'Name'

    def get_sector_name(self, obj):
        return obj.sector_name
    get_sector_name.short_description = 'Sector'

    def get_contract_name(self, obj):
        return obj.contract_name
    get_contract_name.short_description = 'Contract'

    def get_hours_name(self, obj):
        return obj.hours_name
    get_hours_name.short_description = 'Hours'

    def get_status_name(self, obj):
        return obj.status_name
    get_status_name.short_description = 'Status'


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    fields = (
        'get_business',
        'name',
        'description',
        ('email', 'email_public'),
        ('telephone', 'telephone_public'),
        ('mobile', 'mobile_public'),
        'address',
        'latlng',
        'get_location',
    )
    readonly_fields = ('get_business', 'get_location')
    list_display = ('name', 'get_location', 'email', 'telephone', 'mobile', 'created')
    search_fields = ('name', 'email', 'location')
    inlines = (LocationImageInline, JobInline)

    def get_queryset(self, request):
        queryset = super(LocationAdmin, self).get_queryset(request)
        queryset = queryset.annotate(
            location=F('place_name'),
        )
        return queryset

    def get_location(self, obj):
        return obj.location
    get_location.short_description = 'Location'

    def get_business(self, obj):
        return format_html("<a href={}>{}</a>".format(
            reverse('admin:mjp_business_change', args=(obj.business.pk,)),
            obj.business.name,
        ))
    get_business.short_description = 'Business'

    class Media:
        css = {"all": ("css/location_admin_overrides.css",)}


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    fields = (
        'get_business',
        'get_location',
        'status',
        'title',
        'sector',
        'contract',
        'hours',
        'description',
    )
    readonly_fields = (
        'get_business',
        'get_location',
    )
    inlines = (JobImageInline,)

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


class PitchInline(admin.StackedInline):
    model = Pitch
    verbose_name_plural = 'Pitch'
    max_num = 0


class JobProfileInline(admin.StackedInline):
    model = JobProfile
    verbose_name_plural = 'Profile'
    max_num = 0
    readonly_fields = ('place_id', 'place_name', 'postcode_lookup')


class StringAggregate(Aggregate):
    function = 'string_agg'
    name = 'String Aggregate'
    template = '%(function)s(%(distinct)s%(expressions)s)'

    def __init__(self, *expressions, **extra):
        distinct = 'DISTINCT ' if extra.pop('distinct', False) else ''
        super(StringAggregate, self).__init__(*expressions, distinct=distinct, **extra)


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
    filter_kwarg = 'profile__contract__pk'
    title = 'Contract'
    parameter_name = 'contract'


class SexFilter(ProfileShortNameFilter):
    model = Sex
    filter_kwarg = 'sex__pk'
    title = 'Sex'
    parameter_name = 'sex'


class BooleanFilter(admin.SimpleListFilter):
    def queryset(self, request, queryset):
        value = self.value()
        if value == '1':
            return self._true_filter(queryset)
        if value == '0':
            return self._false_filter(queryset)

    def lookups(self, request, model_admin):
        return [
            ('1', "Yes"),
            ('0', "No"),
        ]


class HasPitchFilter(BooleanFilter):
    title = 'Has Pitch'
    parameter_name = 'has_pitch'

    def _false_filter(self, queryset):
        return queryset.filter(pitch_count=0)

    def _true_filter(self, queryset):
        return queryset.filter(pitch_count__gt=0)


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
    list_filter = (ContractFilter, HoursFilter, SexFilter, HasPitchFilter, 'active', SectorFilter)
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
            location=Coalesce(
                Value(None),
                Func(F('profile__place_name'), Value(''), function='NULLIF'),
                Func(F('profile__postcode_lookup'), Value(''), function='NULLIF'),
                Func(
                    Value("%s, %s"),
                    Func(F('profile__latlng'), function='ST_X'),
                    Func(F('profile__latlng'), function='ST_Y'),
                    function='format'
                ),
                output_field=CharField(),
            ),
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
        return u"{} ({} miles)".format(
            job_seeker.location,
            job_seeker.profile.search_radius,
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
    list_display = ('product_code', 'price', 'tokens',)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name', 'priority',)


@admin.register(AppDeprecation)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('platform', 'warning', 'error',)
