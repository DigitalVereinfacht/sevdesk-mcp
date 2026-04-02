#!/bin/sh
exec supergateway \
  --stdio "node /app/build/index.js" \
  --outputTransport sse \
  --port 8000 \
  --host 0.0.0.0 \
  --cors \
  --healthEndpoint /health \
  --oauth2Bearer "$MCP_AUTH_TOKEN"
