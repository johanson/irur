# Filename: Dockerfile
FROM node:10-alpine
ENV LANG C.UTF-8
COPY package*.json ./
RUN npm install --only=prod
COPY . .
EXPOSE 8099
CMD ["node", "server.js"]
