FROM node:24-alpine AS base

WORKDIR /usr/src/app

FROM base AS dependencies

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . .

ARG DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV DATABASE_URL=$DATABASE_URL

RUN npm run prisma:generate
RUN npm run build

FROM dependencies AS migrator

RUN apk add --no-cache openssl

RUN mkdir -p prisma

COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations
COPY prisma.config.ts ./

CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-alpine AS runtime-dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

FROM node:24-alpine AS runtime

RUN apk add --no-cache curl tzdata

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=9000

COPY package.json ./
COPY --from=runtime-dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

RUN mkdir -p uploads

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl --fail --silent http://127.0.0.1:9000/health || exit 1

CMD ["node", "dist/index.js"]
