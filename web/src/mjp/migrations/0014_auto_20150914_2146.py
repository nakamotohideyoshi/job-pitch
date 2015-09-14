# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0013_alter_pitch_api'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='experience',
            name='job_seeker',
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='description',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Experience',
        ),
    ]
