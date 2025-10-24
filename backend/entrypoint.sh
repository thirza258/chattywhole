#!/bin/sh

echo "Waiting for database..."
sleep 3  # optional: or use a wait-for-it script

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Starting Django..."
python manage.py runserver 0.0.0.0:8000
