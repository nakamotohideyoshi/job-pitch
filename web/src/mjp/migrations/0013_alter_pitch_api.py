# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0012_pitch_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='jobseeker',
            name='pitch',
        ),
        migrations.RemoveField(
            model_name='pitch',
            name='image',
        ),
        migrations.AddField(
            model_name='pitch',
            name='job_seeker',
            field=models.ForeignKey(related_name='pitches', default=1, to='mjp.JobSeeker'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pitch',
            name='token',
            field=models.TextField(default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name='pitch',
            name='thumbnail',
            field=models.URLField(null=True),
        ),
        migrations.AlterField(
            model_name='pitch',
            name='video',
            field=models.URLField(null=True),
        ),
    ]
