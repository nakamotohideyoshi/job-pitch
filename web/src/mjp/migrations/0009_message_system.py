# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0008_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='system',
            field=models.BooleanField(default=False),
        ),
    ]
