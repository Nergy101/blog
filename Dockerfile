# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM denoland/deno:alpine AS builder
WORKDIR /app

# Install Lua (required for Astrodon Lua interpolation during build)
RUN apk add --no-cache lua5.4 && ln -sf /usr/bin/lua5.4 /usr/local/bin/lua

# Copy config first to maximize cache hits
COPY deno.json ./
COPY deno.lock* ./

# Copy scripts and sources
COPY build.ts ./
COPY serve.ts ./
COPY routes ./routes
COPY assets ./assets

# Prefetch dependencies for both build and serve
RUN deno cache build.ts serve.ts

# Build the static site into /app/dist
RUN deno run --allow-read --allow-write --allow-run build.ts

# ---- Runtime stage ----
FROM denoland/deno:alpine
WORKDIR /app

# Install Lua for any runtime Lua execution needs
RUN apk add --no-cache lua5.4 && ln -sf /usr/bin/lua5.4 /usr/local/bin/lua

# Copy built assets
COPY --from=builder /app/dist ./dist

# Copy server entry and import map
COPY --from=builder /app/serve.ts ./serve.ts
COPY --from=builder /app/deno.json ./deno.json

# Reuse cached deps to avoid network on container start
COPY --from=builder /deno-dir /deno-dir

EXPOSE 8000
CMD ["run", "--allow-read=./dist", "--allow-net", "--allow-run", "./serve.ts"]

# docker build -t blog .
# docker run --rm -p 8000:8000 blog
# docker tag blog nergy101/blog:latest
# docker push nergy101/blog:latest