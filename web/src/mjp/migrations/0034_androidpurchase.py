# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-12-13 11:49
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0033_user_can_create_businesses'),
    ]

    operations = [
        migrations.CreateModel(
            name='AndroidPurchase',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purchase_token', models.TextField(unique=True)),
                ('product_code', models.CharField(max_length=255)),
                ('token_store', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='mjp.TokenStore')),
            ],
        ),
    ]
