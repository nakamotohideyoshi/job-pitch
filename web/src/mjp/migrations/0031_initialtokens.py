# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-09-15 13:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0030_business_token_store_not_null'),
    ]

    operations = [
        migrations.CreateModel(
            name='InitialTokens',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tokens', models.IntegerField()),
            ],
        ),
    ]
