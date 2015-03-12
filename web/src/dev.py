import settings
import sys

import os
BASE_DIR = None

globals().update(vars(sys.modules['settings']))

DEBUG = True
TEMPLATE_DEUG = True

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

