# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0010_message_created'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pitch',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('video', models.FileField(max_length=255, upload_to=b'pitch/%Y/%m/%d')),
                ('thumbnail', models.ImageField(max_length=255, upload_to=b'pitch/%Y/%m/%d')),
            ],
        ),
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ('created',)},
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='pitch',
            field=models.ForeignKey(related_name='job_seeker', to='mjp.Pitch', null=True),
        ),
    ]
