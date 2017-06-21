from django.shortcuts import render


# New ones url
def index(request):
    return render(request, 'index.html')
