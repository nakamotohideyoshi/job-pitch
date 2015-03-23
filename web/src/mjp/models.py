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

class Availability(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)
    
    class Meta:
        verbose_name_plural = "availabilities"

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
    email = models.EmailField()
    telephone = models.CharField(max_length=100)
    mobile = models.CharField(max_length=100)
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
    required_availability = models.ForeignKey(Availability, related_name='jobs')
    status = models.ForeignKey(JobStatus, related_name='jobs')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s (%s)" % (type(self).__name__, self.title, self.location.name)

class JobSeeker(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='job_seeker')
    telephone = models.CharField(max_length=100)
    mobile = models.CharField(max_length=100)
    age = models.PositiveSmallIntegerField()
    sex = models.ForeignKey(Sex, related_name='job_seekers')
    nationality = models.ForeignKey(Nationality, related_name='job_seekers')
    # TODO address
    # TODO media
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.user.get_full_name())

class Experience(models.Model):
    details = models.CharField(max_length=255)
    order = models.PositiveSmallIntegerField()
    job_seeker = models.ForeignKey(JobSeeker, related_name='experience')
    
    class Meta:
        verbose_name_plural = "experience"

class JobProfile(models.Model):
    job_seeker = models.ForeignKey(JobSeeker, related_name='profiles')
    # TODO search parameters
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.job_seeker.user.get_full_name())

class Application(models.Model):
    job = models.ForeignKey(Job, related_name='applications')
    job_seeker = models.ForeignKey(JobSeeker, related_name='applications')
    created_by = models.ForeignKey(Role, related_name='created_applications')
    deleted_by = models.ForeignKey(Role, related_name='deleted_applications', null=True)
    shortlisted = models.BooleanField(default=False)
    status = models.ForeignKey(ApplicationStatus, related_name='applications')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "%s: %s for %s" % (type(self).__name__, self.job.title, self.job_seeker.user.get_full_name())
