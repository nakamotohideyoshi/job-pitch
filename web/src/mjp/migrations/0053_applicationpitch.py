# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-05-30 21:34
from __future__ import unicode_literals

import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0052_jobvideo'),
    ]

    operations = [
        migrations.CreateModel(
            name='ApplicationPitch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.TextField(default=uuid.uuid4, editable=False)),
                ('video', models.URLField(max_length=512, null=True)),
                ('thumbnail', models.URLField(max_length=512, null=True)),
                ('application', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pitches', to='mjp.Application')),
                ('job_seeker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='application_pitches', to='mjp.JobSeeker')),
            ],
        ),
    ]
