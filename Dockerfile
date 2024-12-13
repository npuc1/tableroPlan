FROM node:22-alpine

#MAINTAINER Sergio Rodríguez <sergio.rdzsg@gmail.com>

ADD . /tablero-plan
WORKDIR /tablero-plan

RUN npm i -g yarn --force \
&& yarn install \
&& yarn build \
&& yarn global add serve \
&& yarn cache clean

CMD ["serve", "-s", "build", "-l", "3000"]
