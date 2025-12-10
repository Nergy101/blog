---
title: Astrodon
date: 2025-09-01
author: Christian / Nergy101
tags: [deno, static-site, markdown]
---

# 🌌 Astrodon

A fast, modern static site generator built with Deno. Features dynamic content generation and optimized build performance.

**By the way, this blog uses Astrodon as well!**

## Source Code

Available on [GitHub](https://github.com/Nergy101/astrodon)

Published on [JSR](https://jsr.io/@nergy101/astrodon)

## Basic Usage

Below is how this blog uses Astrodon for building and serving the site.

### build.ts

```ts
#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { build } from "astrodon";

await build({
  contentDir: new URL("./routes", import.meta.url).pathname,
  outDir: new URL("./dist", import.meta.url).pathname,
  assetsDir: new URL("./assets", import.meta.url).pathname,
  componentsDir: new URL("./components", import.meta.url).pathname,
});
```

### serve.ts

```ts
#!/usr/bin/env -S deno run --allow-read --allow-net --allow-run
import { serve } from "astrodon";

await serve({
  root: new URL("./dist", import.meta.url).pathname,
  port: 8000,
});
```

## Docker Deployment

This blog uses a minimal Dockerfile setup for hosting through Docker. The Dockerfile uses a multi-stage build:

1. **Build stage**: Uses Deno to build the static site from markdown files
2. **Runtime stage**: Uses nginx to serve the built static files

The Docker image of this blog is available as `nergy101/blog:latest` on Docker Hub.

The **Dockerfile** is as follows:

```dockerfile
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

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static site
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

And the **nginx.conf** is as follows:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle clean URLs - try exact path, then with .html, then as directory
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

This allows for clean URLs and caching of static assets.
E.g. [/projects/astrodon.html](https://blog.nergy.space/projects/astrodon.html) will be served under [/projects/astrodon](https://blog.nergy.space/projects/astrodon) as well.

## Features

- **Markdown Processing**: Advanced markdown parsing with custom extensions
- **Asset Optimization**: Automatic WebP conversion and optimization
- **Fast Builds**: Intelligent caching and parallel processing
- **Modern Output**: Clean, semantic HTML with responsive design

## Tech Stack

- **Runtime**: Deno
- **Language**: TypeScript
- **Styling**: Custom CSS with CSS variables
- **Build System**: Custom build pipeline

## Key Benefits

- **Fast Development**: See the watch.ts script for hot reloading and instant rebuilds
- **Flexible**: Custom extensions and dynamic content
- **Optimized**: Automatic image optimization and caching
- **Simple Deployment**: Docker deployment with nginx as example
