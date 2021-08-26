FROM node:14

RUN mkdir /project
WORKDIR /project

COPY . .

RUN npm install lodash --save
RUN npm install

CMD ["npm", "start"]