from django.db import models
from django.contrib.auth.models import User

class Sector(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

class Contract(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()

class Hours(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    
    class Meta:
        verbose_name_plural = "hours"

class Availability(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    
    class Meta:
        verbose_name_plural = "availabilities"

class Business(models.Model):
    user = models.ManyToManyField(User, related_name='businesses')
    name = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
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

class JobStatus(models.Model):
    name = models.CharField(max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()
    
    class Meta:
        verbose_name_plural = "job statuses"

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

class Sex(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
       
    class Meta:
        verbose_name_plural = "sexes"

class Nationality(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    
    class Meta:
        verbose_name_plural = "nationalities"

class JobSeeker(models.Model):
    user = models.ManyToManyField(User, related_name='job_seekers')
    telephone = models.CharField(max_length=100)
    mobile = models.CharField(max_length=100)
    age = models.PositiveSmallIntegerField()
    sex = models.ForeignKey(Sex, related_name='job_seekers')
    nationality = models.ForeignKey(Nationality, related_name='job_seekers')
    # TODO address
    # TODO media
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class Experience(models.Model):
    details = models.CharField(max_length=255)
    order = models.PositiveSmallIntegerField()
    job_seeker = models.ForeignKey(JobSeeker, related_name='experience')
    
    class Meta:
        verbose_name_plural = "experience"

class JobProfile(models.Model):
    job_seeker = models.ForeignKey(JobSeeker, related_name='profiles')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class ApplicationStatus(models.Model):
    name = models.CharField(max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()
    
    class Meta:
        verbose_name_plural = "application statuses"

class Role(models.Model):
    name = models.CharField(max_length=20)

class Application(models.Model):
    job = models.ForeignKey(Job, related_name='applications')
    job_seeker = models.ForeignKey(JobSeeker, related_name='applications')
    created_by = models.ForeignKey(Role, related_name='applications')
    shortlisted = models.BooleanField(default=False)
    status = models.ForeignKey(ApplicationStatus, related_name='applications')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
