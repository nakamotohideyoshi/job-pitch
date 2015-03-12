from django.db import models
from django.contrib.auth.models import User

class Sector(models.Model):
    name = models.CharField(required=True, max_length=255)
    description = models.TextField()

class Contract(models.Model):
    name = models.CharField(required=True, max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()

class Hours(models.Model):
    name = models.CharField(maxrequired=True, _length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()

class Availability(models.Model):
    name = models.CharField(required=True, max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()

class Business(models.Model):
    user = models.ManyToManyField(User, related_name='businesses')
    name = models.CharField(required=True, max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class Location(models.Model):
    business = models.ForeignKey(Business, related_name='locations')
    name = models.CharField(required=True, max_length=255)
    description = models.TextField()
    # TODO address
    email = models.EmailField()
    telephone = models.CharField(max_length=100)
    mobile = models.CharField(max_length=100)
    # TODO media
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class JobStatus(models.Model):
    name = models.CharField(required=True, max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()

class Job(models.Model):
    title = models.CharField(required=True, max_length=255)
    description = models.TextField()
    sector = models.ForeignKey(Sector, required=True, related_name='jobs')
    location = models.ForeignKey(Location, required=True, related_name='jobs')
    contract = models.ForeignObject(Contract, related_name='jobs')
    hours = models.ForeignKey(Hours, related_name='jobs')
    required_availability = models.ForeignKey(Availability, related_name='jobs')
    status = models.ForeignKey(JobStatus, required=True, related_name='jobs')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class Sex(models.Model):
    name = models.CharField(required=True, max_length=255)
    short_name = models.CharField(max_length=255)

class Nationality(models.Model):
    name = models.CharField(required=True, max_length=255)
    short_name = models.CharField(max_length=255)

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
    details = models.CharField(required=True, max_length=255)
    order = models.PositiveSmallIntegerField(required=True)
    job_seeker = models.ForeignKey(JobSeeker, required=True, related_name='experience')

class JobProfile(models.Model):
    job_seeker = models.ForeignKey(JobSeeker, required=True, related_name='profiles')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

class ApplicationStatus(models.Model):
    name = models.CharField(required=True, max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()

class Role(models.Model):
    name = models.CharField(max_length=20)

class Application(models.Model):
    job = models.ForeignKey(Job, required=True, related_name='applications')
    job_seeker = models.ForeignKey(JobSeeker, required=True, related_name='applications')
    created_by = models.ForeignKey(Role, required=True, related_name='applications')
    shortlisted = models.BooleanField(required=True)
    status = models.ForeignKey(ApplicationStatus, required=True, related_name='applications')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
