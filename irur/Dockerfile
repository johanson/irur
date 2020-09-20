# Filename: Dockerfile
ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
WORKDIR /usr/src/app
RUN apk add --update --no-cache nodejs npm dumb-init
COPY package*.json ./
RUN npm install --only=prod
COPY . .
RUN chmod +x /usr/src/app/scripts/*
ENTRYPOINT ["/usr/src/app/scripts/start.sh"]