from urlparse import urljoin

from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import get_template

from mjp.models import Message, Role


@receiver(post_save, sender=Message)
def send_message_notification_email(sender, instance, created, *args, **kwargs):
    if created:
        try:
            job_seeker = instance.application.job_seeker
            location = instance.application.job.location
            if instance.from_role.name == Role.RECRUITER:
                to_address = job_seeker.user.email
                from_name = location.name
            elif instance.from_role.name == Role.JOB_SEEKER:
                to_address = location.email
                from_name = "{} {}".format(job_seeker.first_name, job_seeker.last_name)
            else:
                to_address = "jamie_cockburn@hotmail.co.uk"
                from_name = 'unknown'
            site = Site.objects.get_current()
            scheme = "http" if site.domain.startswith('localhost') and settings.DEBUG else "https"
            base_url = "{}://{}".format(scheme, site.domain)
            media_url = urljoin(base_url, settings.MEDIA_URL)
            context = {
                'from_name': from_name,
                'base_url': base_url,
                'media_url': media_url,
                'message': instance,
            }
            text_template = get_template("emails/message.txt")
            html_template = get_template('emails/message.html')
            send_mail(
                subject="My Job Pitch message from {}".format(from_name),
                message=text_template.render(context),
                html_message=html_template.render(context),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_address],
            )
        except Exception as e:
            import traceback
            send_mail(
                subject='Error sending for Message pk: {}'.format(instance.pk),
                message=traceback.format_exc(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["jamie_cockburn@hotmail.co.uk"],
            )
