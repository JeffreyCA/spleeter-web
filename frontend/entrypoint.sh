#!/bin/sh

if [ -z "${DJANGO_DEVELOPMENT}" ]; then
    npm run build
else
    npm run dev
fi
