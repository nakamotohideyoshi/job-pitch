from django.core.management.base import BaseCommand

from mjp.models import JobSeeker


class Command(BaseCommand):
    help = 'Sends a test job seeker welcome email'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)

    def handle(self, *args, **options):
        job_seeker = JobSeeker.objects.get(user__email__iexact=options['email'])
        job_seeker.send_welcome_email()
