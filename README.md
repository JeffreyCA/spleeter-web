# Spleeter Web
A web application for isolating or removing the vocal, accompaniment, bass, and/or drum components of any song. For example, you can use it to isolate the vocals of a track, or remove the vocals to get an instrumental version of a song.

It is powered by [Spleeter](https://github.com/deezer/spleeter), the awesome source separation library from Deezer. Specifically, it uses the pretrained [`4stems-model`](https://github.com/deezer/spleeter/wiki/3.-Models#pretrained-model) model, which performs audio separation very well.

The app uses [Django](https://www.djangoproject.com/) for the backend API, [React](https://reactjs.org/) for the frontend, [PostgreSQL](https://www.postgresql.org/) for the database, and [Huey](https://huey.readthedocs.io/en/latest/)+[Redis](https://redis.io/) for the task queue.

![](./screenshots/main.png)

## Requirements
* Python 3.4+
* Node.JS 12
* Redis
* PostgreSQL
* ffmpeg

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
