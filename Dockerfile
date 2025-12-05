# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM denoland/deno:alpine AS builder
WORKDIR /app

# Copy config first to maximize cache hits
COPY deno.json deno.lock* ./

# Copy scripts and sources
COPY build.ts serve.ts ./
COPY routes ./routes
COPY assets ./assets
COPY components ./components

# Prefetch dependencies and build static site
RUN deno cache build.ts serve.ts && \
    deno run --allow-read --allow-write --allow-run build.ts

# ---- Runtime stage ----
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built static site
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker build -t blog .
# docker run --rm -p 8000:80 blog
