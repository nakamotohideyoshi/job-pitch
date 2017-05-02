from django.apps import AppConfig


class MJPConfig(AppConfig):
    name = 'mjp'

    def ready(self):
        from mjp import signals
