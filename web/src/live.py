from settings import *

DEBUG = False

TEMPLATE_DEUG = False

EMAIL_PORT = 25

USE_X_FORWARDED_HOST = True

try:
    from local_live import *
except ImportError:
    pass

STATIC_ROOT = '/web/mjp/static/'
MEDIA_ROOT = '/web/mjp/media/'
DEFAULT_FROM_EMAIL = 'webmaster@sclabs.co.uk'
