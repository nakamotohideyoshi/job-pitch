# -*- coding: utf-8 -*-
import os.path

from django.db import migrations

def create_objects(apps, schema_editor):
    Sector = apps.get_model('mjp', 'Sector')
    for name in ['Retail', 'Hospitality']:
        obj = Sector()
        obj.name = name
        obj.description = 'Jobs in %s' % name
        obj.save()
    
    Contract = apps.get_model('mjp', 'Contract')
    for name, short_name in [('Temporary', 'Temp'), ('Permanent', 'Perm')]:
        obj = Contract()
        obj.name = name
        obj.short_name = short_name
        obj.description = "%s contract" % name
        obj.save()
    
    Hours = apps.get_model('mjp', 'Hours')
    for name, short_name in [('Full Time', 'FT'), ('Part Time', 'PT')]:
        obj = Hours()
        obj.name = name
        obj.short_name = short_name
        obj.description = name
        obj.save()
    
    Availability = apps.get_model('mjp', 'Availability')
    for name in ['Flexible', 'Evenings', 'Weekends', 'Weekdays']:
        obj = Availability()
        obj.name = name
        obj.short_name = name
        obj.description = name
        obj.save()
    
    JobStatus = apps.get_model('mjp', 'JobStatus')
    for name, f_name in [('OPEN', 'Open'), ('CLOSED', 'Closed')]:
        obj = JobStatus()
        obj.name = name
        obj.friendly_name = f_name
        obj.description = "%s for applications" % f_name
        obj.save()
    
    Sex = apps.get_model('mjp', 'Sex')
    for name, short_name in [('Male', 'm'), ('Female', 'f')]:
        obj = Sex()
        obj.name = name
        obj.short_name = short_name
        obj.save()
    
    Nationality = apps.get_model('mjp', 'Nationality')
    filename = os.path.join(os.path.dirname(__file__), 'nationalities.dat')
    with open(filename) as f:
        for name in f:
            obj = Nationality()
            obj.name = name
            obj.short_name = name
            obj.save()
    
    ApplicationStatus = apps.get_model('mjp', 'ApplicationStatus')
    for name in ['CREATED', 'ESTABLISHED', 'DELETED']:
        obj = ApplicationStatus()
        obj.name = name
        obj.save()
    
    Role = apps.get_model('mjp', 'Role')
    for name in ['RECRUITER', 'JOB_SEEKER']:
        obj = Role()
        obj.name = name
        obj.save()

class Migration(migrations.Migration):
    dependencies = [('mjp', '0001_initial')]
    operations = [migrations.RunPython(create_objects)]
