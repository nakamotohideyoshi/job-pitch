from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework.authtoken import views as auth_token_views

import views

urlpatterns = patterns('',
    url(r'^api/', include(views.router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-rest-auth/', include('rest_auth.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
