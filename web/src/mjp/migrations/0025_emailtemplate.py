# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-07-20 20:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0024_jobseeker_truth_confirmation'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailTemplate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[(b'MESSAGE', b'Message')], max_length=256, unique=True)),
                ('from_address', models.EmailField(max_length=254)),
                ('subject', models.CharField(max_length=1000)),
                ('body', models.TextField()),
                ('context_help', models.TextField()),
            ],
        ),
    ]
