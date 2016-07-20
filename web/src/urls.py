from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

from mjp import views as mjp_views

urlpatterns = [
    url(r'^api/', include(mjp_views.router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-rest-auth/', include('rest_auth.urls')),
    url(r'^api-rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^', include('web.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
