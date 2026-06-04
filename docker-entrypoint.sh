#!/bin/sh

echo "Waiting for PostgreSQL..."
while ! python -c "import psycopg2; psycopg2.connect(
    dbname='${DB_NAME}',
    user='${DB_USER}',
    password='${DB_PASSWORD}',
    host='${DB_HOST}',
    port='${DB_PORT}'
).close()" 2>/dev/null; do
  sleep 2
done
echo "PostgreSQL is ready"

echo "Waiting for MinIO..."
while ! python -c "import urllib.request; urllib.request.urlopen('http://minio:9000/minio/health/live')" 2>/dev/null; do
  sleep 2
done
echo "MinIO is ready"

cd core
python manage.py migrate
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --threads 2

