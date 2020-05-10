FROM python:3.7.7-buster
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN apt-get update && apt-get install -y ffmpeg libasound2-dev libsndfile-dev
RUN pip install -r requirements.txt
COPY app config django_react frontend manage.py package.json /code/
