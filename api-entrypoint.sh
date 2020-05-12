#!/bin/bash

# Collect static files
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
    echo "Waiting for asset creation"
    while [ ! -d /webapp/frontend/assets/dist ]; do
        sleep 1
    done
    echo "Collect static files"
    python manage.py collectstatic --noinput
fi

# Apply database migrations
echo "Waiting for postgres..."
while ! nc -z db 5432; do
    sleep 0.1
done
echo "PostgreSQL started"

echo "Applying migrations"
python manage.py makemigrations api
python manage.py migrate

echo "Starting server"
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
    gunicorn -b 0.0.0.0:8000 django_react.wsgi
else
    python manage.py runserver 0.0.0.0:8000
fi
