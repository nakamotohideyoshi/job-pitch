# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0005_auto_20150521_2044'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationimage',
            name='thumbnail',
            field=models.ImageField(default='', max_length=255, upload_to=b'business/%Y/%m/%d'),
            preserve_default=False,
        ),
    ]
