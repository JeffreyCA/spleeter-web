release: python manage.py migrate
web: gunicorn django_react.wsgi --log-file -
huey: python manage.py run_huey
