# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('shortlisted', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ApplicationStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
                ('friendly_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name_plural': 'application statuses',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Availability',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name_plural': 'availabilities',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Business',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('users', models.ManyToManyField(related_name='businesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'businesses',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Experience',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('details', models.CharField(max_length=255)),
                ('order', models.PositiveSmallIntegerField()),
            ],
            options={
                'verbose_name_plural': 'experience',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Hours',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name_plural': 'hours',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('contract', models.ForeignKey(related_name='jobs', to='mjp.Contract')),
                ('hours', models.ForeignKey(related_name='jobs', to='mjp.Hours')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='JobProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='JobSeeker',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('telephone', models.CharField(max_length=100)),
                ('mobile', models.CharField(max_length=100)),
                ('age', models.PositiveSmallIntegerField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='JobStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
                ('friendly_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name_plural': 'job statuses',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('email', models.EmailField(max_length=75)),
                ('telephone', models.CharField(max_length=100)),
                ('mobile', models.CharField(max_length=100)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('business', models.ForeignKey(related_name='locations', to='mjp.Business')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Nationality',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name_plural': 'nationalities',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Sector',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Sex',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name_plural': 'sexes',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='nationality',
            field=models.ForeignKey(related_name='job_seekers', to='mjp.Nationality'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='sex',
            field=models.ForeignKey(related_name='job_seekers', to='mjp.Sex'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='user',
            field=models.ForeignKey(related_name='job_seekers', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='jobprofile',
            name='job_seeker',
            field=models.ForeignKey(related_name='profiles', to='mjp.JobSeeker'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='location',
            field=models.ForeignKey(related_name='jobs', to='mjp.Location'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='required_availability',
            field=models.ForeignKey(related_name='jobs', to='mjp.Availability'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='sector',
            field=models.ForeignKey(related_name='jobs', to='mjp.Sector'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='status',
            field=models.ForeignKey(related_name='jobs', to='mjp.JobStatus'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='experience',
            name='job_seeker',
            field=models.ForeignKey(related_name='experience', to='mjp.JobSeeker'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='application',
            name='created_by',
            field=models.ForeignKey(related_name='created_applications', to='mjp.Role'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='application',
            name='deleted_by',
            field=models.ForeignKey(related_name='deleted_applications', to='mjp.Role'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='application',
            name='job',
            field=models.ForeignKey(related_name='applications', to='mjp.Job'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='application',
            name='job_seeker',
            field=models.ForeignKey(related_name='applications', to='mjp.JobSeeker'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='application',
            name='status',
            field=models.ForeignKey(related_name='applications', to='mjp.ApplicationStatus'),
            preserve_default=True,
        ),
    ]
