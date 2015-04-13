from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

class Sector(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

class Contract(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

class Hours(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "hours"

class JobStatus(models.Model):
    name = models.CharField(max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "job statuses"

class Sex(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "sexes"

class Nationality(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "nationalities"

class ApplicationStatus(models.Model):
    name = models.CharField(max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "application statuses"

class Role(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

class Business(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='businesses')
    name = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "businesses"

class Location(models.Model):
    business = models.ForeignKey(Business, related_name='locations')
    name = models.CharField(max_length=255)
    description = models.TextField()
    # TODO address
    email = models.EmailField(blank=True)
    email_public = models.BooleanField(default=None)
    telephone = models.CharField(max_length=100, blank=True)
    telephone_public = models.BooleanField(default=None)
    mobile = models.CharField(max_length=100, blank=True)
    mobile_public = models.BooleanField(default=None)
    # TODO media
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    sector = models.ForeignKey(Sector, related_name='jobs')
    location = models.ForeignKey(Location, related_name='jobs')
    contract = models.ForeignKey(Contract, related_name='jobs')
    hours = models.ForeignKey(Hours, related_name='jobs')
    status = models.ForeignKey(JobStatus, related_name='jobs')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s (%s)" % (type(self).__name__, self.title, self.location.name)

class JobSeeker(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='job_seeker')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    email_public = models.BooleanField(default=None)
    telephone = models.CharField(max_length=100, blank=True)
    telephone_public = models.BooleanField(default=None)
    mobile = models.CharField(max_length=100, blank=True)
    mobile_public = models.BooleanField(default=None)
    age = models.PositiveSmallIntegerField(null=True)
    age_public = models.BooleanField(default=None)
    sex = models.ForeignKey(Sex, related_name='job_seekers', null=True)
    sex_public = models.BooleanField(default=None)
    nationality = models.ForeignKey(Nationality, related_name='job_seekers', null=True)
    nationality_public = models.BooleanField(default=None)
    # TODO address
    # TODO media
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def get_full_name(self):
        return " ".join((self.first_name, self.last_name))
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.get_full_name())

class Experience(models.Model):
    details = models.CharField(max_length=255)
    order = models.PositiveSmallIntegerField()
    job_seeker = models.ForeignKey(JobSeeker, related_name='experience')
    
    class Meta:
        verbose_name_plural = "experience"

class JobProfile(models.Model):
    job_seeker = models.OneToOneField(JobSeeker, related_name='profile')
    sectors = models.ManyToManyField(Sector, related_name='job_profiles')
    contract = models.ForeignKey(Contract, related_name='job_profiles')
    hours = models.ForeignKey(Hours, related_name='job_profiles')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.job_seeker.get_full_name())

class Application(models.Model):
    job = models.ForeignKey(Job, related_name='applications')
    job_seeker = models.ForeignKey(JobSeeker, related_name='applications')
    created_by = models.ForeignKey(Role, related_name='created_applications')
    deleted_by = models.ForeignKey(Role, related_name='deleted_applications', null=True)
    shortlisted = models.BooleanField(default=False)
    status = models.ForeignKey(ApplicationStatus, related_name='applications')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('job', 'job_seeker')
    
    def __str__(self):
        return "%s: %s for %s" % (type(self).__name__, self.job.title, self.job_seeker.get_full_name())
