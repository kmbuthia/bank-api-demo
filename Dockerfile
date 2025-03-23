FROM node:20.18.3-alpine

WORKDIR /app

RUN apk update && apk add bash && apk add build-base && apk add python3

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

CMD ["yarn", "run", "start:dev"]