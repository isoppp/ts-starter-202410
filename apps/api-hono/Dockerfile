# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.3.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS/Prisma"

# NodeJS/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential openssl

RUN npm i -g pnpm

# Copy application code
COPY --link . .

RUN pnpm i --prod

# Final stage for app image
FROM base

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
COPY --from=build /app /app

# Entrypoint prepares the database.
ENTRYPOINT ["/app/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]
