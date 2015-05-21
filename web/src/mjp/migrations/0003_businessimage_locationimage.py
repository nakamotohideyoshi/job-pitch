# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0002_initial_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='BusinessImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(max_length=255, upload_to=b'business/%Y/%m/%d')),
                ('business', models.ForeignKey(related_name='images', to='mjp.Business')),
            ],
        ),
        migrations.CreateModel(
            name='LocationImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(max_length=255, upload_to=b'location/%Y/%m/%d')),
                ('location', models.ForeignKey(related_name='images', to='mjp.Location')),
            ],
        ),
    ]
