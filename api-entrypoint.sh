#!/bin/bash

# Collect static files
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
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
python manage.py runserver 0.0.0.0:8000
