from allauth.account.views import ConfirmEmailView
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.views import password_reset_confirm, password_reset_complete

from mjp import views
from mjp.views import ecommerce, public, indeed

urlpatterns = [
    url(r'^api/paypal/purchase/$', ecommerce.PayPalPurchaseView.as_view()),
    url(r'^api/paypal/confirm/$', ecommerce.PayPalPurchaseConfirmView.as_view(), name="paypal-confirm"),
    url(r'^api/android/purchase/$', ecommerce.AndroidPurchaseView.as_view()),
    url(r'^api/initial-tokens/$', ecommerce.InitialTokensView.as_view()),
    url(r'^api/public/businesses/(?P<pk>\d+)/$', public.PublicBusinessListing.as_view()),
    url(r'^api/public/locations/(?P<pk>\d+)/$', public.PublicLocationListing.as_view()),
    url(r'^api/public/jobs/(?P<pk>\d+)/$', public.PublicJobListing.as_view()),
    url(r'^api/public/job-seekers/(?P<pk>\d+)/$', public.PublicJobSeekerListing.as_view()),
    url(r'^api/indeed/', indeed.IndeedFeedView.as_view(), name='indeed'),
    url(r'^api/', include(views.router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-rest-auth/', include('rest_auth.urls')),
    url(r'^api-rest-auth/registration/account-confirm-email/(?P<key>\w+)/$', ConfirmEmailView.as_view(),
        name='account_confirm_email'),
    url(r'^api-rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^password-reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        password_reset_confirm,
        name='password_reset_confirm',
    ),
    url(r'^reset/done/$', password_reset_complete, name='password_reset_complete'),
    url(r'^admin/', include(admin.site.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    url(r'^', include('web.urls')),
]
