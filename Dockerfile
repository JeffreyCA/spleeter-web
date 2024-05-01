FROM python:3.9-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /webapp/media /webapp/staticfiles
WORKDIR /webapp

# Install all dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libasound2-dev libsndfile-dev libhdf5-dev

COPY requirements.txt requirements-spleeter.txt /webapp/
RUN pip install --upgrade pip wheel && pip install -r requirements.txt
RUN pip install -r requirements-spleeter.txt --no-dependencies

COPY . .

# Copy over entrypoint script
COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /
ENTRYPOINT ["api-entrypoint.sh"]
