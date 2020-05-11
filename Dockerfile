FROM python:3.7.7-buster

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# RUN mkdir -p /spleeter-web/app /spleeter-web/config /spleeter-web/django_react /spleeter-web/frontend
WORKDIR /spleeter-web

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
# Install other system dependencies
RUN apt-get update && apt-get install -y ffmpeg libasound2-dev libsndfile-dev netcat nodejs

# Install Python dependencies
COPY requirements.txt /spleeter-web/
RUN pip install --upgrade pip -r requirements.txt

# Install Node dependencies
COPY frontend/package.json /spleeter-web/frontend/
COPY frontend/.npmrc /spleeter-web/frontend/
WORKDIR /spleeter-web/frontend
RUN npm install

WORKDIR /spleeter-web
COPY . .

# Copy over entrypoint script
COPY web-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/web-entrypoint.sh
RUN ln -s /usr/local/bin/web-entrypoint.sh /
ENTRYPOINT ["web-entrypoint.sh"]
