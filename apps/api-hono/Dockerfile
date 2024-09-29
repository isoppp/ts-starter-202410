# syntax = docker/dockerfile:1

FROM node:22-slim as base

WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl

FROM base as build

COPY --link apps/api-hono .
RUN npm i -g pnpm
RUN pnpm i --prod

# Final stage for app image
FROM base

ENV NODE_ENV=production
COPY --from=build /app /app

CMD [ "npm", "start" ]
