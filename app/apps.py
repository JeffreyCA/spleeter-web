from django.apps import AppConfig

class MyAppConfig(AppConfig):
    name = 'app'

    def ready(self):
        import app.signals
