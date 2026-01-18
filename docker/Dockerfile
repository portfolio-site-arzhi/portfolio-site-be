FROM node:24-alpine

RUN apk add --no-cache tzdata curl python3 make g++

WORKDIR /usr/src/app

COPY . .

RUN npm install

ARG DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run prisma:generate

RUN npm run build

EXPOSE 9000
CMD ["npm", "start"]
