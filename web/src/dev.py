import settings
import sys

import os

BASE_DIR = None

globals().update(vars(sys.modules['settings']))

DEBUG = True
TEMPLATE_DEUG = True

MIDDLEWARE_CLASSES += (
    'mjp.middleware.PlainExceptionsMiddleware',
)

try:
    from local import *
except ImportError:
    pass

