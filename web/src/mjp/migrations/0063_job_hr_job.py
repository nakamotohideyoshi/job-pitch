# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-09-23 21:00
from __future__ import unicode_literals

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0001_initial'),
        ('mjp', '0062_jobs_to_job_ads'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='hr_job',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='hr.Job'),
        ),
    ]
