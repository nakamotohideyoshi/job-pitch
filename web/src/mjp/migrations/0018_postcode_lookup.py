# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-17 11:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0017_jobseeker_cv'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobprofile',
            name='postcode_lookup',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AddField(
            model_name='location',
            name='postcode_lookup',
            field=models.CharField(blank=True, max_length=10),
        ),
    ]
