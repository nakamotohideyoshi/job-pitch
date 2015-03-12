from django.conf.urls import patterns, include, url
from django.contrib import admin

import views

from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = patterns('',
    url(r'^api/', include(router.urls)),
#     url(r'^api/users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
    url(r'^admin/', include(admin.site.urls)),
)
