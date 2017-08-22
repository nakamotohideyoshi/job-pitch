from settings import *

DEBUG = False

TEMPLATE_DEUG = False

EMAIL_PORT = 25

try:
    from local_live import *
except ImportError:
    pass
