release: python manage.py migrate && python manage.py migrate --run-syncdb
web: gunicorn django_react.wsgi --log-file -
