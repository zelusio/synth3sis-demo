FROM node:18.16.1 as builder

WORKDIR /opt/app
COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn run build

EXPOSE 3000
CMD yarn run start

FROM node:18.16.1-alpine as runner

WORKDIR /opt/app
ENV NO_COLOR=1
ENV PORT=3000

COPY --from=builder /opt/app/next.config.js ./
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/.next ./.next
COPY --from=builder /opt/app/node_modules ./node_modules

EXPOSE 3000
CMD yarn run start