from django.conf import settings
from django.db import models

from mjp.models import Nationality, Sex, Location


class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.ForeignKey(Location, related_name='roles')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class Employee(models.Model):
    job = models.ForeignKey(Job, related_name='employees')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    telephone = models.CharField(max_length=100, blank=True)
    sex = models.ForeignKey(Sex, related_name='employees', null=True)
    nationality = models.ForeignKey(Nationality, related_name='employees', null=True)
    birthday = models.DateField(null=True)
    national_insurance_number = models.CharField(max_length=13, blank=True)
    profile_image = models.ImageField(upload_to='job-seeker-profile/%Y/%m/%d', max_length=255, blank=True, null=True)
    profile_thumb = models.ImageField(upload_to='job-seeker-profile/%Y/%m/%d', max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class EmployeeUser(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='employment')
    employee = models.OneToOneField(Employee)
    email = models.EmailField(null=True)
