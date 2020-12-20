#!/bin/bash

CELERY_FAST_QUEUE_CONCURRENCY="${CELERY_FAST_QUEUE_CONCURRENCY:-3}"
CELERY_SLOW_QUEUE_CONCURRENCY="${CELERY_SLOW_QUEUE_CONCURRENCY:-1}"

echo "Starting Celery"

mkdir -p celery

celery -A api -l WARNING --statedb=./celery/celery.state -Q fast_queue -c $CELERY_FAST_QUEUE_CONCURRENCY
celery -A api -l WARNING --statedb=./celery/celery.state -Q slow_queue -c $CELERY_SLOW_QUEUE_CONCURRENCY

# Start the first process
celery -A api -l WARNING --statedb=./celery/celery.state -Q fast_queue -c $CELERY_FAST_QUEUE_CONCURRENCY --detach

status=$?
fast_pid=$!

echo "Fast PID is: $fast_pid"
if [ $status -ne 0 ]; then
  echo "Failed to start celery worker (fast): $status"
  exit $status
fi

# Start the second process
celery -A api -l WARNING --statedb=./celery/celery.state -Q slow_queue -c $CELERY_SLOW_QUEUE_CONCURRENCY --detach

status=$?
slow_pid=$!

echo "Slow PID is: $slow_pid"
if [ $status -ne 0 ]; then
  echo "Failed to start celery worker (slow): $status"
  exit $status
fi

# Naive check runs checks once a minute to see if either of the processes exited.
# This illustrates part of the heavy lifting you need to do if you want to run
# more than one service in a container. The container exits with an error
# if it detects that either of the processes has exited.
# Otherwise it loops forever, waking up every 60 seconds

while sleep 60; do
  ps aux |grep my_first_process |grep -q -v grep
  PROCESS_1_STATUS=$?
  ps aux | grep my_second_process | grep -q -v grep
  PROCESS_2_STATUS=$?
  # If the greps above find anything, they exit with 0 status
  # If they are not both 0, then something is wrong
  if [ $PROCESS_1_STATUS -ne 0 -o $PROCESS_2_STATUS -ne 0 ]; then
    echo "One of the processes has already exited."
    exit 1
  fi
done
