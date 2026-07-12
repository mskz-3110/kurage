FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_INSTALL=/root/.bun
ENV DENO_INSTALL=/root/.deno
ENV PATH="${BUN_INSTALL}/bin:${DENO_INSTALL}/bin:${PATH}"
ENV VHS_NO_SANDBOX=true

ARG VHS_VER
ARG TTYD_VER
ARG WORKDIR

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git unzip \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
RUN curl -fsSL https://deno.land/install.sh | sh

RUN npm install -g pnpm

RUN apt update && apt install -y ffmpeg \
  && curl -L https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb \
  && apt install -y ./chrome.deb \
  && rm -f chrome.deb \
  && curl -L https://github.com/charmbracelet/vhs/releases/download/v${VHS_VER}/vhs_${VHS_VER}_Linux_x86_64.tar.gz -o vhs.tar.gz \
  && tar -xvf vhs.tar.gz \
  && mv vhs_${VHS_VER}_Linux_x86_64/vhs /usr/local/bin/vhs \
  && rm -f vhs.tar.gz \
  && curl -L https://github.com/tsl0922/ttyd/releases/download/${TTYD_VER}/ttyd.x86_64 -o /usr/local/bin/ttyd \
  && chmod a+x /usr/local/bin/ttyd

WORKDIR ${WORKDIR}

COPY package.json pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile
