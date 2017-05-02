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
)


@admin.register(Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, Message)
class Admin(admin.ModelAdmin):
    pass


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
