#!/bin/bash
echo "Starting Celery"
celery -A api worker -l WARNING --statedb=/var/run/celery/worker.state
