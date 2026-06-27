FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_INSTALL=/root/.bun
ENV DENO_INSTALL=/root/.deno
ENV PATH="${BUN_INSTALL}/bin:${DENO_INSTALL}/bin:${PATH}"

ARG WORKDIR

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git unzip \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
RUN curl -fsSL https://deno.land/install.sh | sh
RUN npm install -g pnpm

WORKDIR ${WORKDIR}

COPY package.json pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile
