from django.contrib import admin
from .models import Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, User, Message, EmailTemplate


@admin.register(Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, User, Message)
class Admin(admin.ModelAdmin):
    pass


@admin.register(EmailTemplate)
class Admin(admin.ModelAdmin):
    exclude = ('name',)
    readonly_fields = ('context_help',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
