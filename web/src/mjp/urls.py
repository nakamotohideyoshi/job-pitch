from django.conf.urls import patterns, include, url
from django.contrib import admin

import views

urlpatterns = patterns('',
    url(r'^api/', include(views.router.urls)),
#     url(r'^api/users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
    url(r'^admin/', include(admin.site.urls)),
)
