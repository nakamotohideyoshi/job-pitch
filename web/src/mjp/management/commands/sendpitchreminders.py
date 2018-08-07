from datetime import datetime, timedelta

import pytz
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.template.loader import get_template

from mjp.models import JobSeeker


class Command(BaseCommand):
    help = 'Sends any outstanding pitch reminder emails'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, *args, **options):
        job_seekers = JobSeeker.objects.filter(
            active=True,
            pitches__isnull=True,
            pitch_reminder_sent__isnull=True,
            created__lte=pytz.utc.localize(datetime.utcnow()) - timedelta(days=1),
            user__isnull=False,
        )[:10]
        for job_seeker in job_seekers:
            if not options['dry_run']:
                self.send_email(job_seeker)
                job_seeker.pitch_reminder_sent = pytz.utc.localize(datetime.utcnow())
                job_seeker.save()
            else:
                print job_seeker.user.email

    def send_email(self, job_seeker):
        try:
            site = Site.objects.get_current()
            scheme = "http" if site.domain.startswith('localhost') and settings.DEBUG else "https"
            base_url = "{}://{}".format(scheme, site.domain)
            context = {
                'base_url': base_url,
                'job_seeker': job_seeker,
            }
            text_template = get_template("emails/pitch_reminder.txt")
            html_template = get_template('emails/pitch_reminder.html')
            send_mail(
                subject="My Job Pitch: You're Hired?",
                message=text_template.render(context),
                html_message=html_template.render(context),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[job_seeker.user.email],
            )
        except Exception:
            import traceback
            send_mail(
                subject='Error sending pitch reminder email for: {}'.format(job_seeker.user.email),
                message=traceback.format_exc(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["jamie_cockburn@hotmail.co.uk"],
            )
