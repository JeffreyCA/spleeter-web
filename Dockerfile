FROM python:3.7-buster AS celery-fast

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /webapp
RUN mkdir -p /webapp/{media,staticfiles}

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libasound2-dev libsndfile-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /webapp/
RUN pip install -r requirements.txt

COPY . .


COPY celery-fast-entrypoint.sh .
ENTRYPOINT ["./celery-fast-entrypoint.sh"]

FROM celery-fast AS celery-slow
COPY celery-slow-entrypoint.sh .
ENTRYPOINT ["./celery-slow-entrypoint.sh"]


FROM node:14-buster AS frontend
WORKDIR /webapp/frontend
RUN mkdir -p /webapp/frontend/assets

COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install

COPY frontend/ .
RUN ./entrypoint.sh


FROM celery-fast AS api
COPY --from=frontend /webapp/frontend/assets /webapp/frontend/assets
COPY api-entrypoint.sh .
ENTRYPOINT ["./api-entrypoint.sh"]
