from django.conf.urls import patterns, include, url

urlpatterns = patterns('web.views',
    url(r'^$', 'index'),
	url(r'^login/$', 'login'),
	url(r'^registration/$', 'registration'),
	url(r'^profile/password-reset/$', 'password_reset'),
	url(r'^profile/password-reset-confirm/$', 'password_reset_confirm'),
	url(r'^profile/password-change/$', 'password_change'),
	url(r'^profile/$', 'profile'),
	url(r'^profile/create-job-seeker/$', 'create_profile_job_seeker'),
	url(r'^profile/create-business/$', 'create_business'),
	url(r'^profile/create-location/$', 'create_location'),
	url(r'^profile/edit-job-seeker/$', 'edit_profile_job_seeker'),
	url(r'^profile/list-businesses/$', 'list_businesses'),
	url(r'^profile/list-locations/$', 'list_locations'),
	url(r'^profile/list-jobs/$', 'list_jobs'),
	url(r'^profile/create-job/$', 'create_job'),
	url(r'^profile/edit-job/$', 'edit_job'),
	url(r'^profile/pitch/$', 'pitch'),	
	url(r'^profile/job-preferences/$', 'job_preferences'),	
	url(r'^logout/$', 'logout'),
	url(r'^terms-conditions/$', 'terms_conditions'),
	url(r'^privacy-policy/$', 'privacy_policy'),
	url(r'^mobile-app/$', 'mobile_app'),
	url(r'^about/$', 'about'),
	url(r'^applications/$', 'applications'),
	url(r'^messages/$', 'messages'),
	url(r'^jobs/$', 'jobs'),
	url(r'^single-job/$', 'single_job'),
	url(r'^dashboard/$', 'dashboard'),
	url(r'^profile/edit-job-preferences/$', 'edit_job_preferences'),
	url(r'^find-staff/$', 'find_staff'),
	url(r'^profile/viewpitch/$', 'viewpitch'),
)
