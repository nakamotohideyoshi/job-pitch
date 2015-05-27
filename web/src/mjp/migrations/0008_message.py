# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0007_auto_20150524_2045'),
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField()),
                ('read', models.BooleanField(default=False)),
                ('application', models.ForeignKey(related_name='messages', to='mjp.Application')),
                ('from_role', models.ForeignKey(to='mjp.Role')),
            ],
        ),
    ]
