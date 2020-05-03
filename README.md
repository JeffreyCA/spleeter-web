# Spleeter Web
A web application for separating songs into its individual parts: vocals, accompaniment, bass, and drums. It is powered by [Spleeter](https://github.com/deezer/spleeter), the awesome source separation library from Deezer. Specifically, it uses the pretrained [`4stems-model`](https://github.com/deezer/spleeter/wiki/3.-Models#pretrained-model) model, which performs audio separation quite well.

The app uses [Django](https://www.djangoproject.com/) for the backend API, [React](https://reactjs.org/) for the frontend, [PostgreSQL](https://www.postgresql.org/) for the database, and [Huey](https://huey.readthedocs.io/en/latest/)+[Redis](https://redis.io/) for the task queue.

## Requirements
* Python 3.4+
* Node.JS 12
* Redis

## Getting started (locally)
1. Start backend and frontend servers:
    ```sh
    > python3 -m venv env
    > source env/bin/activate
    > pip install -r requirements.txt
    > npm run dev
    ```

2. Start Huey worker (in a separate session):
    ```sh
    > source env/bin/activate
    > python manage.py run_huey
    ```

## Deploying
The app in its current state is not ready to be deployed yet!
