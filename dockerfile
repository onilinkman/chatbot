FROM node:trixie-slim

WORKDIR /app

RUN apt-get update -y && \
	apt-get upgrade -y && \
	apt-get install nano -y

RUN npm i -g @nestjs/cli

ENTRYPOINT [ "sh", "-c", "npm install && npm run start" ]