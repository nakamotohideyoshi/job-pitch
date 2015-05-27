# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0009_message_system'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 5, 27, 21, 27, 48, 351536, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
    ]
