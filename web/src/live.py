from settings import *

DEBUG = False
TEMPLATE_DEUG = False

EMAIL_PORT = 25
DEFAULT_FROM_EMAIL = 'hello@myjobpitch.com'

USE_X_FORWARDED_HOST = True

STATIC_ROOT = '/web/mjp/static/'
MEDIA_ROOT = '/web/mjp/media/'

try:
    from local_live import *
except ImportError:
    pass
