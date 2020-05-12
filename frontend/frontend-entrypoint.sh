#!/bin/bash

echo "Starting frontend"
rm -rf assets/dist
if [[ -z "${DJANGO_DEVELOPMENT}" ]]; then
    npm run prod
else
    npm run dev
fi
