FROM oven/bun:latest

WORKDIR /opt/app
COPY package*.json ./
ENV PORT=3000
ENV NODE_ENV=production
# install bun
RUN bun install
COPY ./src .
COPY ./public .
COPY .env .
COPY next.config.js .
COPY next-env.d.ts .

RUN bun run build

EXPOSE 3000
CMD bun run start