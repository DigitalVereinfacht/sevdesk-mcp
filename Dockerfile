FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10

WORKDIR /build
RUN git clone https://github.com/sajadghawami/sevdesk-mcp.git .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:24-slim

RUN npm install -g supergateway

WORKDIR /app
COPY --from=builder /build/build ./build
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./

EXPOSE 8000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
