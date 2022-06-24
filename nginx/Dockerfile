FROM jonasal/nginx-certbot:latest

ENV API_HOST=api

COPY *.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/*.sh
