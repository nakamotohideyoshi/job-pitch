import settings
import sys
globals().update(vars(sys.modules['settings']))

DEBUG = True

TEMPLATE_DEUG = True

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mjpdb',
        'USER': 'mjp',
        'PASS': 'hdiH33mjp',
        'HOST': 'localhost',
    }
}

