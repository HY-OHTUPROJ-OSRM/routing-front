FROM node:20-alpine as build-stage

ARG ROUTING_API_URL=http://localhost:3000/
ENV REACT_APP_ROUTING_API_URL=${ROUTING_API_URL}

RUN mkdir -p /src
COPY package.json package-lock.json /src/

WORKDIR /src

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27.0 as run-stage

COPY --from=build-stage /src/build /usr/share/nginx/html
