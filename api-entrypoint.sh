#!/bin/bash

# Collect static files
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
    echo "Waiting for asset creation"
    while [ ! -d /webapp/frontend/assets/dist ]; do
        sleep 1
    done
    echo "Collect static files"
    python3.8 manage.py collectstatic --noinput
fi

echo "Applying migrations"
python3.8 manage.py makemigrations api
python3.8 manage.py migrate

echo "Starting server"
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
    gunicorn -b $API_HOST:8000 django_react.wsgi
else
    python3.8 manage.py runserver $API_HOST:8000
fi
