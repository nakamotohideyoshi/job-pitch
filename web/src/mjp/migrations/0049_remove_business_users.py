# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-03-02 16:34
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0048_copy_business_users_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='business',
            name='users',
        ),
    ]