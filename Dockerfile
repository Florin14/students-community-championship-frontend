# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# Builder: produce the static bundle. Nothing from this stage reaches the
# runtime image except dist/ - no node_modules, no toolchain, no sources.
# ---------------------------------------------------------------------------
FROM node:22.21.0-alpine AS builder

WORKDIR /app

# Manifests first, so the dependency layer is reused on every code-only change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `npm run build` type-checks first (tsc --noEmit), so a type error fails the
# image build rather than shipping.
RUN npm run build \
    # No source maps in the image: minified bundles are the ceiling of what we
    # protect, and maps would hand back readable sources.
    && find dist -name '*.map' -type f -delete

# ---------------------------------------------------------------------------
# Runtime: nginx serving the bundle.
# ---------------------------------------------------------------------------
FROM nginx:1.29.1-alpine AS runtime

ARG VERSION=dev
ARG GIT_SHA=dev
ARG BUILD_DATE=""

LABEL org.opencontainers.image.title="students-community-championship-frontend" \
      org.opencontainers.image.description="SCC championship web app" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="UNLICENSED"

ENV APP_VERSION=${VERSION} \
    GIT_SHA=${GIT_SHA} \
    BUILD_DATE=${BUILD_DATE}

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# The stock nginx entrypoint runs every /docker-entrypoint.d/*.sh before
# starting the server. Hooking in there - rather than replacing the entrypoint -
# keeps nginx's own template/envsubst handling intact.
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=4s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/health || exit 1
