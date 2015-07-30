from django.conf.urls import patterns, include, url

urlpatterns = patterns('web.views',
    url(r'^$', 'index'),
	url(r'^login/$', 'login'),
	url(r'^registration/$', 'registration'),
	url(r'^profile/password-reset/$', 'password_reset'),
	url(r'^profile/password-reset-confirm/$', 'password_reset_confirm'),
	url(r'^profile/password-change/$', 'password_change'),
	url(r'^profile/$', 'profile'),
	url(r'^profile/job-seeker$', 'profile_job_seeker'),
	url(r'^profile/business$', 'profile_business'),
	url(r'^profile/pitch$', 'pitch'),	
	url(r'^logout/$', 'logout'),
	url(r'^terms-conditions/$', 'terms_conditions'),
	url(r'^privacy-policy/$', 'privacy_policy'),
	url(r'^mobile-app/$', 'mobile_app'),
	url(r'^about/$', 'about'),
)
