from os import path

from django.http import HttpResponse
from django.shortcuts import render

APP_PATH = path.dirname(__file__)
TEMPLATES_PATH = path.join(APP_PATH, "templates")


def apple_app_site_association(request):
    filename = path.join(path.join(TEMPLATES_PATH, ".well-known"), "apple-app-site-association")
    with open(filename) as f:
        return HttpResponse(f.read(), content_type="application/json")


def asset_links(request):
    filename = path.join(path.join(TEMPLATES_PATH, ".well-known"), "assetlinks.json")
    with open(filename) as f:
        return HttpResponse(f.read(), content_type="application/json")


def index(request):
    return render(request, 'index.html')
