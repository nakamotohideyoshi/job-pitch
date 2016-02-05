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
	
def password_reset(request):
    return render(request, 'profile/password-reset.html')

def password_reset_confirm(request):
    return render(request, 'profile/password-reset-confirm.html')
	
def password_change(request):
    return render(request, 'profile/password-change.html')
	
def profile(request):
    return render(request, 'profile/main.html')

def terms_conditions(request):
    return render(request, 'content/terms-conditions.html')	
	
def privacy_policy(request):
    return render(request, 'content/privacy-policy.html')	
	
def mobile_app(request):
    return render(request, 'content/mobile-app.html')	
	
def about(request):
    return render(request, 'content/about.html')	
	
def pitch(request):
    return render(request, 'profile/pitch.html')	
	
def create_profile_job_seeker(request):
    return render(request, 'profile/create-job-seeker.html')	

def create_business(request):
    return render(request, 'profile/create-business.html')	
	
def edit_business(request):
    return render(request, 'profile/edit-business.html')	

def create_profile_location(request):
    return render(request, 'profile/create-location.html')	
	
def edit_location(request):
    return render(request, 'profile/edit-location.html')	
	
def edit_profile_job_seeker(request):
    return render(request, 'profile/edit-job-seeker.html')	
	
def list_businesses(request):
    return render(request, 'profile/list-businesses.html')
	
def list_locations(request):
    return render(request, 'profile/list-locations.html')
	
def list_jobs(request):
    return render(request, 'profile/list-jobs.html')
	
def create_job(request):
    return render(request, 'profile/create-job.html')
	
def edit_job(request):
    return render(request, 'profile/edit-job.html')
	
def create_location(request):
    return render(request, 'profile/create-location.html')

def messages(request):
    return render(request, 'messages.html')
	
def applications(request):
    return render(request, 'applications.html')

def job_preferences(request):
    return render(request, 'profile/job-preferences.html')
	
def jobs(request):
    return render(request, 'jobs.html')

def single_job(request):
    return render(request, 'single-job.html')
	
def dashboard(request):
    return render(request, 'dashboard.html')
	
def edit_job_preferences(request):
    return render(request, 'profile/edit-job-preferences.html')
	
def edit_pitch(request):
    return render(request, 'profile/edit-pitch.html')	
	
def find_staff(request):
    return render(request, 'find-staff.html')		
	
def viewpitch(request):
    return render(request, 'profile/viewpitch.html')