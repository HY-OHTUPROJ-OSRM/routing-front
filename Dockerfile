FROM node:20-alpine as build-stage

ARG ROUTING_API_URL=https://routing-api-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/
ENV REACT_APP_ROUTING_API_URL=${ROUTING_API_URL}

RUN mkdir -p /src
COPY package.json package-lock.json /src/

WORKDIR /src

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27.0 as run-stage

COPY --from=build-stage /src/build /usr/share/nginx/html
