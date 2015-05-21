# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0003_businessimage_locationimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessimage',
            name='order',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationimage',
            name='order',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
