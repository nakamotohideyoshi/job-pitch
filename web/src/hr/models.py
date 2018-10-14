from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.db import models

from mjp.models import Nationality, Sex, Location, create_thumbnail


class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.ForeignKey(Location, related_name='roles')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "%s (%s)" % (self.title, self.location.name)


class Employee(models.Model):
    job = models.ForeignKey(Job, related_name='employees', null=True, on_delete=models.SET_NULL)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='employees', null=True, on_delete=models.SET_NULL)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    telephone = models.CharField(max_length=100, blank=True)
    sex = models.ForeignKey(Sex, related_name='employees', null=True)
    nationality = models.ForeignKey(Nationality, related_name='employees', null=True)
    birthday = models.DateField(null=True)
    national_insurance_number = models.CharField(max_length=13, blank=True)
    profile_image = models.ImageField(upload_to='employee-profile/%Y/%m/%d', max_length=255, blank=True, null=True)
    profile_thumb = models.ImageField(upload_to='employee-profile/%Y/%m/%d', max_length=255, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def get_full_name(self):
        return " ".join((self.first_name, self.last_name))

    def save(self, *args, **kwargs):
        if not self.profile_image:
            self.profile_thumb = None
        elif isinstance(self.profile_image.file, UploadedFile):
            create_thumbnail(self.profile_image, self.profile_thumb)
        super(Employee, self).save(*args, **kwargs)

    def __str__(self):
        return self.get_full_name()
