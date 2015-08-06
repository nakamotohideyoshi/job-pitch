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

def create_profile_business(request):
    return render(request, 'profile/create-business.html')	
	
def edit_profile_job_seeker(request):
    return render(request, 'profile/edit-job-seeker.html')	

def edit_profile_business(request):
    return render(request, 'profile/edit-business.html')	
	
def list_businesses(request):
    return render(request, 'profile/list-businesses.html')
	
def list_locations(request):
    return render(request, 'profile/list-locations.html')