FROM node:16-alpine

WORKDIR /root

COPY package*.json ./

RUN npm install
RUN npm i -g @nestjs/cli
RUN nest new backend
RUN mkdir backend/avatars
RUN chmod 777 backend/avatars
COPY default_avatar.png ./backend/avatars/

EXPOSE 3000
EXPOSE 8000
EXPOSE 8001

CMD cd /root/backend ; npm run start
