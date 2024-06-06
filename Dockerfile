FROM node:20-alpine as build-stage

ARG ROUTING_API_URL=https://routing-api-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/
ENV REACT_APP_ROUTING_API_URL=${ROUTING_API_URL}

RUN mkdir -p /src
COPY package.json package-lock.json /src/

WORKDIR /src

RUN npm ci

COPY . .

RUN npm run build

FROM registry.access.redhat.com/ubi9/nginx-124 as run-stage

COPY --from=build-stage /src/build /usr/share/nginx/html

ADD test-app/nginx.conf "${NGINX_CONF_PATH}"
ADD test-app/nginx-default-cfg/*.conf "${NGINX_DEFAULT_CONF_PATH}"
ADD test-app/nginx-cfg/*.conf "${NGINX_CONFIGURATION_PATH}"
ADD test-app/*.html .

CMD nginx -g "daemon off;"
