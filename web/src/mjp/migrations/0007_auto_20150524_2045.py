# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0006_locationimage_thumbnail'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(max_length=255, upload_to=b'job/%Y/%m/%d')),
                ('thumbnail', models.ImageField(max_length=255, upload_to=b'job/%Y/%m/%d')),
                ('order', models.IntegerField()),
                ('job', models.ForeignKey(related_name='images', to='mjp.Job')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.AlterField(
            model_name='locationimage',
            name='thumbnail',
            field=models.ImageField(max_length=255, upload_to=b'location/%Y/%m/%d'),
        ),
    ]
