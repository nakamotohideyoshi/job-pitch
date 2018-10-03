# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-09-23 20:41
from __future__ import unicode_literals

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mjp', '0061_exclusion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='contract',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='mjp.Contract'),
        ),
        migrations.AlterField(
            model_name='job',
            name='hours',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='mjp.Hours'),
        ),
        migrations.AlterField(
            model_name='job',
            name='location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='mjp.Location'),
        ),
        migrations.AlterField(
            model_name='job',
            name='sector',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='mjp.Sector'),
        ),
        migrations.AlterField(
            model_name='job',
            name='status',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='adverts', to='mjp.JobStatus'),
        ),
    ]