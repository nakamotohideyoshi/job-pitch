# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0011_auto_20150618_2043'),
    ]

    operations = [
        migrations.AddField(
            model_name='pitch',
            name='image',
            field=models.ImageField(default='', max_length=255, upload_to=b'pitch/%Y/%m/%d'),
            preserve_default=False,
        ),
    ]
