from django.shortcuts import render
from django.http.response import HttpResponse


def index(request):
    return render(request, 'home.html')

def login(request):
    return render(request, 'login.html')

def registration(request):
    return render(request, 'registration.html')

def logout(request):
    return render(request, 'logout.html')

def profile(request):
    return render(request, 'profile/profile.html')

def terms_conditions(request):
    return render(request, 'content/terms-conditions.html')

def privacy_policy(request):
    return render(request, 'content/privacy-policy.html')

def mobile_app(request):
    return render(request, 'content/mobile-app.html')

def about(request):
    return render(request, 'content/about.html')

def howitworks_jobseeker(request):
    return render(request, 'content/howitworks-jobseeker.html')

def howitworks_recruiter(request):
    return render(request, 'content/howitworks-recruiter.html')

def pitch(request):
    return render(request, 'profile/pitch.html')

def create_profile_job_seeker(request):
    return render(request, 'profile/job-seeker-create.html')

def create_business(request):
    return render(request, 'profile/create-business.html')

def edit_business(request):
    return render(request, 'profile/edit-business.html')

def add_work_place(request):
    return render(request, 'profile/add-work-place.html')

def edit_location(request):
    return render(request, 'profile/edit-location.html')

def edit_profile_job_seeker(request):
    return render(request, 'profile/job-seeker-edit.html')

def list_businesses(request):
    return render(request, 'profile/list-businesses.html')

def list_locations(request):
    return render(request, 'profile/list-locations.html')

def post_a_job(request):
    return render(request, 'profile/post-a-job.html')

def find_posts(request):
    return render(request, 'find-posts.html')

def edit_job(request):
    return render(request, 'profile/edit-job.html')

def create_location(request):
    return render(request, 'profile/create-location.html')

#def messages(request):
#    return render(request, 'messages.html')
def inbox(request):
    return render(request, 'inbox.html')

def applications(request):
    return render(request, 'applications.html')

def connections(request):
    return render(request, 'connections.html')

def job_preferences(request):
    return render(request, 'profile/job-preferences.html')

def find_jobs(request):
    return render(request, 'find-jobs.html')

def single_job(request):
    return render(request, 'single-job.html')

def dashboard(request):
    return render(request, 'dashboard.html')

def edit_job_preferences(request):
    return render(request, 'profile/edit-job-preferences.html')

def edit_pitch(request):
    return render(request, 'profile/edit-pitch.html')

def find_talent(request):
    return render(request, 'find-talent.html')

def viewpitch(request):
    return render(request, 'profile/viewpitch.html')

def profile_payments(request):
    return render(request, 'profile/payments.html')

def notification_settings(request):
    return render(request, 'profile/notification-settings.html')

# New ones url
def profile_job_seeker_create(request):
    return render(request, 'profile/jobseeker-create.html')

def profile_job_seeker_edit(request):
    return render(request, 'profile/jobseeker-edit.html')

def profile_recruiter_create(request):
    return render(request, 'profile/recruiter-create.html')

