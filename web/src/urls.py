from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

from mjp import views as mjp_views

urlpatterns = [
    url(r'^api/paypal/purchase/$', mjp_views.PayPalPurchaseView.as_view()),
    url(r'^api/paypal/confirm/$', mjp_views.PayPalPurchaseConfirmView.as_view(), name="paypal-confirm"),
    url(r'^api/android/purchase/$', mjp_views.AndroidPurchaseView.as_view()),
    url(r'^api/initial-tokens/$', mjp_views.InitialTokensView.as_view()),
    url(r'^api/', include(mjp_views.router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-rest-auth/', include('rest_auth.urls')),
    url(r'^api-rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^admin/', include(admin.site.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    url(r'^', include('web.urls')),
]
