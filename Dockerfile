FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN mkdir -p /webapp/media /webapp/staticfiles
WORKDIR /webapp

# Install all dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git libasound2-dev libsndfile-dev libhdf5-dev libmagic-dev

# For yt-dlp: https://github.com/yt-dlp/yt-dlp/issues/15012
COPY --from=denoland/deno:bin-2.5.6 /deno /usr/local/bin/deno

COPY requirements.txt requirements-spleeter.txt /webapp/
RUN pip install --upgrade pip wheel && pip install -r requirements.txt
RUN pip install -r requirements-spleeter.txt --no-dependencies

COPY . .

# Copy over entrypoint script
COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /
ENTRYPOINT ["api-entrypoint.sh"]
