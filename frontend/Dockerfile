FROM node:16-alpine

WORKDIR /root

COPY package*.json ./
COPY tsconfig.json ./
#ADD src /root/src
#ADD public /root/public

RUN npx create-react-app frontend

#RUN cd frontend ; rm -rf src public package.json package-lock.json
#RUN cd ..
#RUN mv src frontend/ ; mv public frontend/ ; mv package.json package-lock.json tsconfig.json frontend/
RUN mv package* frontend/ ; mv tsconfig.json frontend/

RUN cd frontend/

WORKDIR /root/frontend

RUN npm install -g npm@latest # to update npm because it is sometimes buggy.
RUN rm -rf node_modules# to remove the existing modules.
RUN apk update && apk upgrade

RUN npm install
#RUN npm i react-chartjs-2 chart.js
RUN npm install @mui/styles --force

EXPOSE 3000

#CMD ["tail", "-f", "/dev/null"]
CMD npm start
