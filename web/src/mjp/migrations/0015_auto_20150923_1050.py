# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0014_auto_20150914_2146'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='business',
            options={'ordering': ('name',), 'verbose_name_plural': 'businesses'},
        ),
        migrations.AlterModelOptions(
            name='job',
            options={'ordering': ('status', '-created')},
        ),
        migrations.AlterModelOptions(
            name='location',
            options={'ordering': ('name',)},
        ),
    ]
