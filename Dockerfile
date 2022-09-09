FROM python:3.8-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /webapp/media /webapp/staticfiles
WORKDIR /webapp

COPY requirements.txt /webapp/

# Install all dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libasound2-dev libsndfile-dev && pip install --upgrade pip wheel && pip install -r requirements.txt

COPY . .

# Copy over entrypoint script
COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /
ENTRYPOINT ["api-entrypoint.sh"]
