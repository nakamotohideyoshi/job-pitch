# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0003_auto_20150324_2123'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='email_public',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='mobile_public',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='telephone_public',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]
