# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-09 11:34
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0020_jobseeker_rating'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='jobseeker',
            name='rating',
        ),
    ]