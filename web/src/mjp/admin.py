from django.contrib import admin
from .models import Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, User


@admin.register(Sex, Nationality, Contract, Hours, Sector, Business, JobSeeker, User)
class Admin(admin.ModelAdmin):
    pass
