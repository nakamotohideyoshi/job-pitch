from subprocess import check_call, STDOUT

from django import forms
from django.views.generic import FormView
from django.http import HttpResponse


class Reset(FormView):
    template_name = 'demo_reset.html'
    form_class = forms.Form
    success_url = '.'

    def form_valid(self, form):
        if self.request.POST['submit'] == 'Reset Demo':
            with open('/web/mjp/dump/dump.sql') as f:
                check_call(['psql'], stdin=f, stderr=STDOUT)
        elif self.request.POST['submit'] == 'Save State':
            check_call(['pg_dump', '-c', '-f', '/web/mjp/dump/dump.sql'])
        return super(Reset, self).form_valid(form)
