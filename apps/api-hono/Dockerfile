# syntax = docker/dockerfile:1

FROM node:22-slim as base

WORKDIR /app
ENV NODE_ENV=production

FROM base as build

RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential openssl

RUN npm i -g pnpm

COPY --link apps/api-hono .

RUN pnpm i --prod

# Final stage for app image
FROM base

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
COPY --from=build /app /app

CMD [ "npm", "start" ]
