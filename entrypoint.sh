#!/bin/sh
exec supergateway \
  --stdio "node /app/build/index.js" \
  --outputTransport sse \
  --port 8000 \
  --host 0.0.0.0 \
  --cors \
  --oauth2Bearer "$MCP_AUTH_TOKEN"
