# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0015_auto_20150923_1050'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseeker',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
