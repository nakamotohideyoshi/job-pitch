# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-10-23 21:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0040_workplace_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseeker',
            name='national_insurance_number',
            field=models.CharField(blank=True, max_length=13),
        ),
    ]
