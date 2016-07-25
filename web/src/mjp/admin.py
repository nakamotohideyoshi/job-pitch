from django.contrib import admin
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
)


@admin.register(Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, User, Message)
class Admin(admin.ModelAdmin):
    pass


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
