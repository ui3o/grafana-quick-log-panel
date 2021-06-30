FROM node:slim AS builder
MAINTAINER ui3o.com <ui3o.com@gmail.com>

ARG GRAFANA_API_KEY
ENV GRAFANA_API_KEY=$GRAFANA_API_KEY
ARG GIT_TAG
ENV GIT_TAG=$GIT_TAG

RUN apt-get update
RUN apt-get install -y git

RUN git clone https://github.com/ui3o/grafana-quick-log-panel.git /tmp/grafana-quick-log-panel
WORKDIR /tmp/grafana-quick-log-panel
RUN [[ -n $GIT_TAG ]] && git checkout tags/<tag_name>
RUN yarn
RUN yarn build
RUN yarn sign --rootUrls http://localhost:3000

FROM grafana/grafana:8.0.3
RUN mkdir -p /var/lib/grafana/plugins/grafana-quick-log-panel
COPY --from=builder /tmp/grafana-quick-log-panel/dist /var/lib/grafana/plugins/grafana-quick-log-panel