from settings import *

DEBUG = False

TEMPLATE_DEUG = False

EMAIL_PORT = 25

USE_X_FORWARDED_HOST = True

try:
    from local_live import *
except ImportError:
    pass
