#!/bin/bash

CELERY_FAST_QUEUE_CONCURRENCY="${CELERY_FAST_QUEUE_CONCURRENCY:-3}"

echo "Starting Celery (fast)"

mkdir -p celery

celery -A api worker -l INFO -Q fast_queue \
    --concurrency $CELERY_FAST_QUEUE_CONCURRENCY \
    --statedb=./celery/celery-fast.state
