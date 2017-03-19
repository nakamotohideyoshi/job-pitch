from django.conf.urls import url
from django.contrib.auth import views as auth_views
from allauth.account import views as all_auth_views

from web import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^login/$', views.login),
    url(r'^registration/$', views.registration),
    url(r'^registration/confirm-email/(?P<key>\w+)/$', all_auth_views.confirm_email, name='account_confirm_email'),
    url(r'^password-change/$', auth_views.password_change, name='password_change'),
    url(r'^password-change/done/$', auth_views.password_change_done, name='password_change_done'),
    url(r'^password-reset/$', auth_views.password_reset, name='password_reset'),
    url(r'^password-reset/done/$', auth_views.password_reset_done, name='password_reset_done'),
    url(r'^password-reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        auth_views.password_reset_confirm, name='password_reset_confirm'),
    url(r'^password-reset/complete/$', auth_views.password_reset_complete, name='password_reset_complete'),
    url(r'^profile/$', views.profile),
    url(r'^profile/create-job-seeker/$', views.create_profile_job_seeker),
    url(r'^profile/add-work-place/$', views.add_work_place),
    url(r'^profile/create-location/$', views.create_location),
    url(r'^profile/edit-job-seeker/$', views.edit_profile_job_seeker),
    url(r'^profile/list-businesses/$', views.list_businesses),
    url(r'^profile/list-locations/$', views.list_locations),
    url(r'^profile/post-a-job/$', views.post_a_job),
    url(r'^profile/edit-job/$', views.edit_job),
    url(r'^profile/pitch/$', views.pitch),
    url(r'^profile/job-preferences/$', views.job_preferences),
    url(r'^profile/notification-settings/$', views.notification_settings),
    url(r'^profile/viewpitch/$', views.viewpitch),
    url(r'^profile/edit-pitch/$', views.edit_pitch),
    url(r'^profile/edit-location/$', views.edit_location),
    url(r'^profile/edit-business/$', views.edit_business),
    url(r'^profile/payments/$', views.profile_payments),
    url(r'^find-posts/$', views.find_posts),
    url(r'^logout/$', views.logout),
    url(r'^terms-conditions/$', views.terms_conditions),
    url(r'^privacy-policy/$', views.privacy_policy),
    url(r'^mobile-app/$', views.mobile_app),
    url(r'^about/$', views.about),
    url(r'^howitworks/job-seeker/$', views.howitworks_jobseeker),
    url(r'^howitworks/recruiter/$', views.howitworks_recruiter),
    url(r'^applications/$', views.applications),
    url(r'^connections/$', views.connections),
    url(r'^inbox/$', views.inbox),
    url(r'^find-jobs/$', views.find_jobs),
    url(r'^single-job/$', views.single_job),
    url(r'^dashboard/$', views.dashboard),
    url(r'^profile/edit-job-preferences/$', views.edit_job_preferences),
    url(r'^find-talent/$', views.find_talent),

    url(r'^profile/job-seeker/create/$', views.profile_job_seeker_create),
    url(r'^profile/job-seeker/edit/$', views.profile_job_seeker_edit),
    url(r'^profile/recruiter/create/$', views.profile_recruiter_create),
]
