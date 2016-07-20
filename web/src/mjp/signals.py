from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template import Template, Context

from mjp.models import Message, EmailTemplate, Role


@receiver(post_save, sender=Message)
def send_message_notification_email(sender, instance, created, *args, **kwargs):
    if created:
        try:
            email_template = EmailTemplate.objects.get(name=EmailTemplate.MESSAGE)
            subject_template = Template(email_template.subject)
            body_template = Template(email_template.body)
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
            context = {
                'message': instance,
                'from_name': from_name,
            }
            send_mail(
                subject=subject_template.render(Context(context)),
                message=body_template.render(Context(context)),
                from_email=email_template.from_address,
                recipient_list=[to_address],
            )
        except Exception as e:
            import traceback
            send_mail(
                subject='Error sending for Message pk: {}'.format(instance.pk),
                message=traceback.format_exc(),
                from_email='webmaster@myjobpitch.com',
                recipient_list=["jamie_cockburn@hotmail.co.uk"],
            )
