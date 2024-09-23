# syntax = docker/dockerfile:1

# TODO almost 477MB, might be able to reduce it
# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

RUN apt-get update -qq
RUN apt-get install --no-install-recommends -y ca-certificates curl
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Node.js app lives here
WORKDIR /app

# Enable corepack
RUN corepack enable
RUN pnpm --version

FROM base AS builder

WORKDIR /app

# Install node modules and build
COPY . .
RUN pnpm i
RUN pnpm build

RUN pnpm prune --prod

#CMD ["tail", "-f", "/dev/null"]

# Final stage for app image
FROM base AS prod

WORKDIR /app

# Copy built application

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/server-build /app/server-build
COPY --from=builder /app/build /app/build

COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/index.js /app/index.js


# Set production environment
ENV NODE_ENV="production"
ENV PORT=3000

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 CMD curl --fail http://localhost:3000 || exit 1
CMD [ "npm", "start" ]

