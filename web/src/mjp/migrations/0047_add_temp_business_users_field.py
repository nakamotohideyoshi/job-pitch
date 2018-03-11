# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-03-02 14:56
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0046_fix_location_public_flag_defaults'),
    ]

    operations = [
        migrations.CreateModel(
            name='BusinessUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mjp.Business', related_name='business_users')),
                ('locations', models.ManyToManyField(related_name='business_users', to='mjp.Location', blank=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, related_name='business_users')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='businessuser',
            unique_together={('user', 'business')},
        ),
        migrations.AddField(
            model_name='business',
            name='new_users',
            field=models.ManyToManyField(related_name='new_businesses', through='mjp.BusinessUser', to=settings.AUTH_USER_MODEL),
        ),
    ]
