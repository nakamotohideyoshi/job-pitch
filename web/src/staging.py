from settings import *

DEBUG = True
TEMPLATE_DEUG = True

EMAIL_PORT = 25
DEFAULT_FROM_EMAIL = 'webmaster@sclabs.co.uk'

USE_X_FORWARDED_HOST = True

STATIC_ROOT = '/web/mjp/static/'
MEDIA_ROOT = '/web/mjp/media/'

PAYPAL_TOKEN = {  # paypal-dev@myjobpitch.com, password: Boda100??
    'mode': 'sandbox',
    'client_id': 'AWzWnsMEnHz1_6XpE4rHtYB5rTJ18DH8Lgi6p68V0_XHV5oQrSjxPukTZfu5TPkVneIpFEn0PhJAFN5l',
    'client_secret': 'EJvJP3YjxsZUuvYzV0NEOtS5fUX6C7bGRILVofaHdkjrvfqivWQ8sPXkOZdbLFB67yHuG033640FejsU',
}

MIDDLEWARE_CLASSES += (
    'mjp.middleware.PlainExceptionsMiddleware',
)

try:
    from local import *
except ImportError:
    pass
