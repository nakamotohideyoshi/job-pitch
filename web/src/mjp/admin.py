from django.conf.urls import url
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.core.validators import EMPTY_VALUES, EmailValidator
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
    Pitch)


@admin.register(Sex, Nationality, Contract, Hours, Business, Message)
class Admin(admin.ModelAdmin):
    pass


class PitchInline(admin.StackedInline):
    model = Pitch
    max_num = 0


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
        'sex',
        'get_search_area',
        'has_pitch',
        'get_last_login',
        'latest_application',
        'get_date_joined',
        'active',
    )
    inlines = (
        PitchInline,
    )

    def get_queryset(self, request):
        queryset = super(JobSeekerAdmin, self).get_queryset(request)
        queryset = queryset.select_related('user', 'profile')
        queryset = queryset.prefetch_related('pitches', 'applications')
        return queryset

    def get_full_name(self, job_seeker):
        return " ".join((job_seeker.first_name, job_seeker.last_name))
    get_full_name.short_description = 'Name'

    def get_email(self, job_seeker):
        return job_seeker.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def get_search_area(self, job_seeker):
        profile = job_seeker.profile
        search_area = u"{} (@{} miles)".format(
            profile.place_name or profile.postcode_lookup or profile.latlng,
            profile.search_radius,
            )
        return search_area
    get_search_area.short_description = 'Search Area'

    def get_date_joined(self, jobseeker):
        return jobseeker.user.date_joined
    get_date_joined.short_description = 'Joined'

    def get_last_login(self, jobseeker):
        return jobseeker.user.last_login
    get_last_login.short_description = 'Last Login'

    def has_pitch(self, job_seeker):
        return bool(job_seeker.pitches.count())
    has_pitch.boolean = True

    def latest_application(self, job_seeker):
        return job_seeker.applications.latest('created').created

    def get_pitch_thumbnail(self, job_seeker):
        return job_seeker.pitches.get(thumbnail__isnull=False).thumbnail

    get_pitch_thumbnail.short_description = 'Pitch Thumbnail'

    def get_pitch(self, job_seeker):
        return job_seeker.pitches.get(video__isnull=False).video
    get_pitch.short_description = 'Pitch Video'


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
