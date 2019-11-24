from flask import Flask
from celery import Celery

app = Flask(__name__)
app.config.from_object('config')

def make_celery(app):
    # create context tasks in celery
    celery = Celery(
        app.import_name,
        broker = app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    
    class ContextTask(celery.Task):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(app)
app.app_context().push()

from spleeterweb import routes
