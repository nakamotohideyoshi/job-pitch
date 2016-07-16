import settings
import sys
globals().update(vars(sys.modules['settings']))

DEBUG = True

TEMPLATE_DEUG = True

EMAIL_PORT = 25

try:
    from local_live import *
except ImportError:
    pass
