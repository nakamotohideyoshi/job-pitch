# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0016_jobseeker_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseeker',
            name='cv',
            field=models.FileField(max_length=255, null=True, upload_to=b'cv/%Y/%m/%d'),
        ),
    ]
