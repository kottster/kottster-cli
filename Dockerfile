# kottster/backend image 
# https://hub.docker.com/r/kottster/backend

FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g @kottster/cli

EXPOSE 5480

CMD ["sh", "-c", "while true; do sleep 1000; done"]
