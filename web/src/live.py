import settings
import sys
globals().update(vars(sys.modules['settings']))

DEBUG = True

TEMPLATE_DEUG = True

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'mjp',
        'USER': 'mjp',
        'PASSWORD': 'SGe9+UNoSam/',
        'HOST': 'localhost',
        'PORT': '',
    }
}

try:
    from local_live import *
except ImportError:
    pass

