FROM node:12-buster

RUN mkdir -p /webapp/frontend/assets
WORKDIR /webapp/frontend

# Install Node dependencies
COPY package.json /webapp/frontend/
COPY package-lock.json /webapp/frontend/
RUN npm install

COPY . .

# Copy over entrypoint script
COPY frontend-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh
RUN ln -s /usr/local/bin/frontend-entrypoint.sh /
ENTRYPOINT ["frontend-entrypoint.sh"]
