FROM python:3.7-buster

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /webapp/media /webapp/staticfiles
WORKDIR /webapp

# Install other system dependencies
RUN apt-get update && apt-get install -y ffmpeg libasound2-dev libsndfile-dev netcat

# Install Python dependencies
COPY requirements.txt /webapp/
RUN pip install --upgrade pip -r requirements.txt

COPY . .

# Copy over entrypoint script
COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh
RUN ln -s /usr/local/bin/api-entrypoint.sh /
ENTRYPOINT ["api-entrypoint.sh"]
