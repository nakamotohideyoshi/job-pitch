# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-18 16:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0022_jobseeker_has_references'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pitch',
            name='thumbnail',
            field=models.URLField(max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='pitch',
            name='video',
            field=models.URLField(max_length=512, null=True),
        ),
    ]
