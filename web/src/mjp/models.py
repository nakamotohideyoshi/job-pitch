import uuid
import os

from cStringIO import StringIO
from PIL import Image
from django.db import transaction
from django.utils.translation import gettext as _

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.gis.db import models
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.http import urlquote


def create_thumbnail(image, thumbnail, name=None, content_type=None):
    # original code for this method came from
    # http://snipt.net/danfreak/generate-thumbnails-in-django-with-pil/

    # If there is no image associated with this.
    # do not create thumbnail
    if not image:
        return

    # Set our max thumbnail size in a tuple (max width, max height)
    THUMBNAIL_SIZE = (280, 280) # for android: 70dp at xxxhdpi

    if content_type is None:
        content_type = image.file.content_type
    if name is None:
        name = image.name

    if content_type == 'image/jpeg':
        pil_type = 'jpeg'
        extension = 'jpg'
    elif content_type == 'image/png':
        pil_type = 'png'
        extension = 'png'
    elif content_type == 'image/gif':
        pil_type = 'gif'
        extension = 'gif'

    # Open original photo which we want to thumbnail using PIL's Image
    img = Image.open(StringIO(image.read()))

    # We use our PIL Image object to create the thumbnail, which already
    # has a thumbnail() convenience method that contrains proportions.
    # Additionally, we use Image.ANTIALIAS to make the image look better.
    # Without antialiasing the image pattern artifacts may result.
    img.thumbnail(THUMBNAIL_SIZE, Image.ANTIALIAS)

    # Save the thumbnail
    temp_handle = StringIO()
    img.save(temp_handle, pil_type)
    temp_handle.seek(0)

    # Save image to a SimpleUploadedFile which can be saved into
    # ImageField
    suf = SimpleUploadedFile(os.path.split(name)[-1],
            temp_handle.read(), content_type=content_type)
    # Save SimpleUploadedFile into image field
    thumbnail.save(
        '%s_thumbnail.%s' % (os.path.splitext(suf.name)[0], extension),
        suf,
        save=False
    )


class UserManager(BaseUserManager):

    def _create_user(self, email, password,
                     is_staff, is_superuser, **extra_fields):
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
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    email = models.EmailField(_('email address'), max_length=254, unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    is_staff = models.BooleanField(_('staff status'), default=False,
                                   help_text=_('Designates whether the user can log into this admin '
                                               'site.'))
    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Designates whether this user should be treated as '
                                                'active. Unselect this instead of deleting accounts.'))
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    can_create_businesses = models.BooleanField(default=False)

    objects = UserManager()

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
    priority = models.IntegerField(default=10, help_text="Lower first")

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

    class Meta(object):
        ordering = ('priority', 'name')


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
    CREATED = 'CREATED'
    ESTABLISHED = 'ESTABLISHED'
    DELETED = 'DELETED'

    name = models.CharField(max_length=20)
    friendly_name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

    class Meta:
        verbose_name_plural = "application statuses"


class Role(models.Model):
    RECRUITER = "RECRUITER"
    JOB_SEEKER = "JOB_SEEKER"

    name = models.CharField(max_length=20)

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)


class Business(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='businesses')
    name = models.CharField(max_length=255)
    token_store = models.ForeignKey('TokenStore', related_name='businesses', on_delete=models.DO_NOTHING)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)

    class Meta:
        verbose_name_plural = "businesses"
        ordering = ('name',)


class BusinessImage(models.Model):
    business = models.ForeignKey(Business, related_name='images')
    image = models.ImageField(upload_to='business/%Y/%m/%d', max_length=255)
    thumbnail = models.ImageField(upload_to='business/%Y/%m/%d', max_length=255)
    order = models.IntegerField()

    def save(self, *args, **kwargs):
        create_thumbnail(self.image, self.thumbnail)
        super(BusinessImage, self).save(*args, **kwargs)

    class Meta:
        ordering = ['order']


class Location(models.Model):
    business = models.ForeignKey(Business, related_name='locations')
    name = models.CharField(max_length=255)
    description = models.TextField()
    address = models.TextField(blank=True)
    latlng = models.PointField()
    place_id = models.CharField(max_length=1024, blank=True)
    place_name = models.CharField(max_length=1024)
    postcode_lookup = models.CharField(max_length=10, blank=True)
    email = models.EmailField(blank=True)
    email_public = models.BooleanField(default=None)
    telephone = models.CharField(max_length=100, blank=True)
    telephone_public = models.BooleanField(default=None)
    mobile = models.CharField(max_length=100, blank=True)
    mobile_public = models.BooleanField(default=None)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.name)


class LocationImage(models.Model):
    location = models.ForeignKey(Location, related_name='images')
    image = models.ImageField(upload_to='location/%Y/%m/%d', max_length=255)
    thumbnail = models.ImageField(upload_to='location/%Y/%m/%d', max_length=255)
    order = models.IntegerField()

    def save(self, *args, **kwargs):
        create_thumbnail(self.image, self.thumbnail)
        super(LocationImage, self).save(*args, **kwargs)

    class Meta:
        ordering = ['order']


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

    class Meta:
        ordering = ('status', '-created',)


class JobImage(models.Model):
    job = models.ForeignKey(Job, related_name='images')
    image = models.ImageField(upload_to='job/%Y/%m/%d', max_length=255)
    thumbnail = models.ImageField(upload_to='job/%Y/%m/%d', max_length=255)
    order = models.IntegerField()

    def save(self, *args, **kwargs):
        create_thumbnail(self.image, self.thumbnail)
        super(JobImage, self).save(*args, **kwargs)

    class Meta:
        ordering = ['order']


class JobSeeker(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='job_seeker')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
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
    description = models.TextField()
    active = models.BooleanField(default=True)
    cv = models.FileField(upload_to='cv/%Y/%m/%d', max_length=255, null=True)
    has_references = models.BooleanField(default=False)
    truth_confirmation = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def get_full_name(self):
        return " ".join((self.first_name, self.last_name))

    def __str__(self):
        return "%s: %s" % (type(self).__name__, self.get_full_name())


class Pitch(models.Model):
    token = models.TextField(default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeeker', related_name='pitches')
    video = models.URLField(max_length=512, null=True)
    thumbnail = models.URLField(max_length=512, null=True)


class JobProfile(models.Model):
    job_seeker = models.OneToOneField(JobSeeker, related_name='profile')
    sectors = models.ManyToManyField(Sector, related_name='job_profiles')
    contract = models.ForeignKey(Contract, related_name='job_profiles', null=True)
    hours = models.ForeignKey(Hours, related_name='job_profiles', null=True)
    latlng = models.PointField()
    search_radius = models.IntegerField()
    place_id = models.CharField(max_length=1024, blank=True)
    place_name = models.CharField(max_length=1024)
    postcode_lookup = models.CharField(max_length=10, blank=True)
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


class Message(models.Model):
    application = models.ForeignKey(Application, related_name='messages')
    system = models.BooleanField(default=False)
    from_role = models.ForeignKey(Role)
    content = models.TextField()
    read = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created',)


class EmailTemplate(models.Model):
    MESSAGE = 'MESSAGE'

    NAME_CHOICES = (
        (MESSAGE, 'Message'),
    )

    name = models.CharField(max_length=256, choices=NAME_CHOICES, unique=True)
    from_address = models.EmailField()
    subject = models.CharField(max_length=1000)
    body = models.TextField()
    context_help = models.TextField()

    def __str__(self):
        return self.name


class TokenStore(models.Model):
    class NoTokens(Exception):
        pass

    tokens = models.IntegerField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, related_name='token_stores')

    def decrement(self):
        with transaction.atomic():
            token_store = TokenStore.objects.select_for_update().get(pk=self.pk)
            if token_store.tokens > 0:
                token_store.tokens -= 1
                token_store.save()
                self.tokens = token_store.tokens
                return self.tokens
            raise TokenStore.NoTokens("No more tokens")

    def business_list(self):
        return ", ".join(b.name for b in self.businesses.all())

    def __str__(self):
        return "{} token(s) for {}: {}".format(self.tokens, self.user.email, self.business_list())


class InitialTokens(models.Model):
    tokens = models.IntegerField()


class AndroidPurchase(models.Model):
    purchase_token = models.TextField(unique=True)
    product_code = models.CharField(max_length=255)
    token_store = models.ForeignKey(TokenStore, null=True, on_delete=models.SET_NULL)


class ProductTokens(models.Model):
    sku = models.CharField(max_length=255)
    tokens = models.IntegerField()

    class Meta:
        verbose_name_plural = 'product tokens'
