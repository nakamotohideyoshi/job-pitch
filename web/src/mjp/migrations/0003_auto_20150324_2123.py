# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0002_initial_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='email',
            field=models.EmailField(max_length=75, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='location',
            name='mobile',
            field=models.CharField(max_length=100, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='location',
            name='telephone',
            field=models.CharField(max_length=100, blank=True),
            preserve_default=True,
        ),
    ]
