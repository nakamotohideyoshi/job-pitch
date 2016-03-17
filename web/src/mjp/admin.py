from django.contrib import admin
from .models import Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker


@admin.register(Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker)
class Admin(admin.ModelAdmin):
    pass
