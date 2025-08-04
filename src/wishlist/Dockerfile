# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM docker.io/library/node:22-slim AS builder

WORKDIR /usr/src/app/

COPY ./src/wishlist/package.json package.json
COPY ./src/wishlist/package-lock.json package-lock.json

RUN npm ci --omit=dev

# -----------------------------------------------------------------------------

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /usr/src/app/

COPY --from=builder /usr/src/app/node_modules/ node_modules/

COPY ./pb/demo.proto demo.proto

COPY ./src/wishlist/add.js add.js
COPY ./src/wishlist/index.js index.js
COPY ./src/wishlist/logger.js logger.js

EXPOSE ${WISHLIST_PORT}

CMD ["index.js"]
