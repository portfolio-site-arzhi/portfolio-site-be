FROM node:24-alpine

RUN apk add --no-cache tzdata curl python3 make g++

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
RUN DATABASE_URL=$DATABASE_URL npm run prisma:generate
RUN npm run build

EXPOSE 9000
CMD ["npm", "start"]
