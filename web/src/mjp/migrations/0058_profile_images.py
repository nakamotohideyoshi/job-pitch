# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-07-12 16:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0057_interview_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseeker',
            name='profile_image',
            field=models.ImageField(blank=True, max_length=255, null=True, upload_to=b'job-seeker-profile/%Y/%m/%d'),
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='profile_thumb',
            field=models.ImageField(blank=True, max_length=255, null=True, upload_to=b'job-seeker-profile/%Y/%m/%d'),
        ),
    ]
