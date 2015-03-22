from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

class CustomUserManager(BaseUserManager):

    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        now = timezone.now()
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email,
                          is_staff=is_staff, is_active=True,
                          is_superuser=is_superuser, last_login=now,
                          date_joined=now, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        return self._create_user(email, password, False, False,
                                 **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        return self._create_user(email, password, True, True,
                                 **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    A fully featured User model with admin-compliant permissions that uses
    a full-length email field as the username.

    Email and password are required. Other fields are optional.
    """
    email = models.EmailField(_('email address'), max_length=254, unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    is_staff = models.BooleanField(_('staff status'), default=False,
        help_text=_('Designates whether the user can log into this admin site.'))
    is_active = models.BooleanField(_('active'), default=True,
        help_text=_('Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'))
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def get_absolute_url(self):
        return "/users/%s/" % urlquote(self.email)

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        "Returns the short name for the user."
        return self.first_name

    def email_user(self, subject, message, from_email=None):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email])

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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='job_seekers')
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
