import traceback
from django.http import HttpResponse

class PlainExceptionsMiddleware(object):
    def process_exception(self, request, exception):
        if "HTTP_USER_AGENT" in request.META and "dalvik" in request.META["HTTP_USER_AGENT"].lower():
            traceback.print_exc()
        return
