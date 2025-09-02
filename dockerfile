FROM node:trixie-slim

WORKDIR /app

RUN apt-get update -y && \
	apt-get upgrade -y && \
	apt-get install nano -y && \
	apt-get install git -y

RUN npm i -g @nestjs/cli

ENTRYPOINT [ "sh", "-c", "npm install && npm run build && npm run start" ]

#docker run -d -it -u 1000:1000 --name chatbot -e DB_HOST="200.7.160.216" -e DB_PORT=1521 -e DB_USERNAME="ADM_CHATBOT" -e DB_PWD="orausu10" -e DB_SID="appumsapdb.umsa.bo" -e PORT=4000 -v /app_chatbot:/app -p 4000:4000 chatbot
#--network instalacion-whatsapp_default --ip 172.28.0.4 
#docker run -d -it  --name chatbot2 -e DB_HOST="200.7.160.216" --network instalacion-whatsapp_default --ip 172.28.0.1 -e DB_PORT=1521 -e DB_USERNAME="ADM_CHATBOT" -e DB_PWD="orausu10" -e DB_SID="appumsapdb.umsa.bo" -e PORT=5000 --hostname f5158b352917 -v /app_chatbot:/app -p 4000:4000 chatbot