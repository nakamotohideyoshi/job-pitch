# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-09 11:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0021_remove_jobseeker_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobseeker',
            name='has_references',
            field=models.BooleanField(default=False),
        ),
    ]