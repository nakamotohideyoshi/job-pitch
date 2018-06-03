# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-06-03 22:56
from __future__ import unicode_literals

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0053_applicationpitch'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('at', models.DateTimeField()),
                ('notes', models.TextField(blank=True, help_text=b'Private recruiter notes')),
                ('feedback', models.TextField(blank=True, help_text=b'Job seeker visible feedback')),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='mjp.Application')),
            ],
            options={
                'ordering': ('at',),
            },
        ),
        migrations.AddField(
            model_name='message',
            name='interview',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='mjp.Interview'),
        ),
    ]
