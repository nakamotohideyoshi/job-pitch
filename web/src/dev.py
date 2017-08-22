from settings import *
import sys

import os

BASE_DIR = None

globals().update(vars(sys.modules['settings']))

DEBUG = True
TEMPLATE_DEUG = True

MIDDLEWARE_CLASSES += (
    'mjp.middleware.PlainExceptionsMiddleware',
)

EMAIL_PORT = 1025

PAYPAL_CONFIG = {  # paypal-dev@myjobpitch.com, password: Boda100??
    'mode': 'sandbox',
    'client_id': 'AWzWnsMEnHz1_6XpE4rHtYB5rTJ18DH8Lgi6p68V0_XHV5oQrSjxPukTZfu5TPkVneIpFEn0PhJAFN5l',
    'client_secret': 'EJvJP3YjxsZUuvYzV0NEOtS5fUX6C7bGRILVofaHdkjrvfqivWQ8sPXkOZdbLFB67yHuG033640FejsU',
}

try:
    from local import *
except ImportError:
    pass
