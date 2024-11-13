# base node image
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN pwd

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]