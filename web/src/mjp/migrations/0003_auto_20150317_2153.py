# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0002_initial_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='deleted_by',
            field=models.ForeignKey(related_name='deleted_applications', to='mjp.Role', null=True),
            preserve_default=True,
        ),
    ]
