from django.conf.urls import url

from web import views

urlpatterns = [
    url(r'^\.well-known/apple-app-site-association$', views.apple_app_site_association),
    url(r'^\.well-known/assetlinks.json$', views.asset_links),
    url(r'^.*$', views.index),
]
