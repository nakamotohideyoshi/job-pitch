# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0004_auto_20150521_1950'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='businessimage',
            options={'ordering': ['order']},
        ),
        migrations.AlterModelOptions(
            name='locationimage',
            options={'ordering': ['order']},
        ),
        migrations.AddField(
            model_name='businessimage',
            name='thumbnail',
            field=models.ImageField(default='', max_length=255, upload_to=b'business/%Y/%m/%d'),
            preserve_default=False,
        ),
    ]
