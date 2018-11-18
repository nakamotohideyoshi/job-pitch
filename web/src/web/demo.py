from subprocess import check_call

from django import forms
from django.views.generic import FormView


class Reset(FormView):
    template_name = 'demo_reset.html'
    form_class = forms.Form
    success_url = '.'

    def form_valid(self, form):
        with open('/web/mjp/dump/dump.sql') as f:
            check_call(['psql'], stdin=f)
        return super(Reset, self).form_valid(form)
