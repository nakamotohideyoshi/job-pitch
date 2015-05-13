# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.gis.db.models.fields


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
        ),
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('short_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
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
        ),
        migrations.CreateModel(
            name='JobProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('contract', models.ForeignKey(related_name='job_profiles', to='mjp.Contract', null=True)),
                ('hours', models.ForeignKey(related_name='job_profiles', to='mjp.Hours', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='JobSeeker',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('first_name', models.CharField(max_length=100, blank=True)),
                ('last_name', models.CharField(max_length=100, blank=True)),
                ('email', models.EmailField(max_length=254, blank=True)),
                ('email_public', models.BooleanField(default=None)),
                ('telephone', models.CharField(max_length=100, blank=True)),
                ('telephone_public', models.BooleanField(default=None)),
                ('mobile', models.CharField(max_length=100, blank=True)),
                ('mobile_public', models.BooleanField(default=None)),
                ('age', models.PositiveSmallIntegerField(null=True)),
                ('age_public', models.BooleanField(default=None)),
                ('sex_public', models.BooleanField(default=None)),
                ('nationality_public', models.BooleanField(default=None)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
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
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('address', models.TextField(blank=True)),
                ('latlng', django.contrib.gis.db.models.fields.PointField(srid=4326)),
                ('place_id', models.CharField(max_length=1024, blank=True)),
                ('place_name', models.CharField(max_length=1024)),
                ('email', models.EmailField(max_length=254, blank=True)),
                ('email_public', models.BooleanField(default=None)),
                ('telephone', models.CharField(max_length=100, blank=True)),
                ('telephone_public', models.BooleanField(default=None)),
                ('mobile', models.CharField(max_length=100, blank=True)),
                ('mobile_public', models.BooleanField(default=None)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('business', models.ForeignKey(related_name='locations', to='mjp.Business')),
            ],
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
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Sector',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
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
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='nationality',
            field=models.ForeignKey(related_name='job_seekers', to='mjp.Nationality', null=True),
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='sex',
            field=models.ForeignKey(related_name='job_seekers', to='mjp.Sex', null=True),
        ),
        migrations.AddField(
            model_name='jobseeker',
            name='user',
            field=models.OneToOneField(related_name='job_seeker', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='jobprofile',
            name='job_seeker',
            field=models.OneToOneField(related_name='profile', to='mjp.JobSeeker'),
        ),
        migrations.AddField(
            model_name='jobprofile',
            name='sectors',
            field=models.ManyToManyField(related_name='job_profiles', to='mjp.Sector'),
        ),
        migrations.AddField(
            model_name='job',
            name='location',
            field=models.ForeignKey(related_name='jobs', to='mjp.Location'),
        ),
        migrations.AddField(
            model_name='job',
            name='sector',
            field=models.ForeignKey(related_name='jobs', to='mjp.Sector'),
        ),
        migrations.AddField(
            model_name='job',
            name='status',
            field=models.ForeignKey(related_name='jobs', to='mjp.JobStatus'),
        ),
        migrations.AddField(
            model_name='experience',
            name='job_seeker',
            field=models.ForeignKey(related_name='experience', to='mjp.JobSeeker'),
        ),
        migrations.AddField(
            model_name='application',
            name='created_by',
            field=models.ForeignKey(related_name='created_applications', to='mjp.Role'),
        ),
        migrations.AddField(
            model_name='application',
            name='deleted_by',
            field=models.ForeignKey(related_name='deleted_applications', to='mjp.Role', null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='job',
            field=models.ForeignKey(related_name='applications', to='mjp.Job'),
        ),
        migrations.AddField(
            model_name='application',
            name='job_seeker',
            field=models.ForeignKey(related_name='applications', to='mjp.JobSeeker'),
        ),
        migrations.AddField(
            model_name='application',
            name='status',
            field=models.ForeignKey(related_name='applications', to='mjp.ApplicationStatus'),
        ),
        migrations.AlterUniqueTogether(
            name='application',
            unique_together=set([('job', 'job_seeker')]),
        ),
    ]
