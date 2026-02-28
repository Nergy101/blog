---
title: Astrodon
date: 2025-09-01
author: Christian / Nergy101
tags: [deno, static-site, markdown, ssg, ssr]
---

# 🌌 Astrodon - fast, modern static site generator built with Deno.

**By the way, this blog uses Astrodon as well!**

## Source Code

Available on [GitHub](https://github.com/Nergy101/astrodon) 

Published on [JSR](https://jsr.io/@nergy101/astrodon)
- **JSR Score**: 100%
- **Install**: `deno add jsr:@nergy101/astrodon`
- **Works with**: Deno, Bun
- **Latest version**: 0.2.5

## Basic Usage

Below is how this blog uses Astrodon for building and serving the site.

```ts 
// build.ts
import { build } from "astrodon";

await build({
  contentDir: new URL("./routes", import.meta.url).pathname,
  outDir: new URL("./dist", import.meta.url).pathname,
  assetsDir: new URL("./assets", import.meta.url).pathname,
  componentsDir: new URL("./components", import.meta.url).pathname,
});
```

```ts
// serve.ts
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
E.g. `/projects/astrodon.html` will be served under `/projects/astrodon` as well.

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

## Markdown Showcase

Astrodon supports comprehensive markdown features. Here's a showcase of what's possible:

### Text Formatting

Let's start with **bold text** and _italic text_. We can also use **_bold italic_** for emphasis.

~~Strikethrough text~~ shows deleted content, while `inline code` highlights technical terms.

### Lists

Here's an unordered list:

- First item
- Second item with **bold text**
- Third item with _italic text_
- Fourth item with `code`

And an ordered list:

1. First numbered item
2. Second numbered item
3. Third numbered item
   1. Nested item
   2. Another nested item

### Code Blocks

```typescript
import { serve } from "jsr:@std/http/server";

const handler = async (req: Request): Promise<Response> => {
  const currentTime = new Date().toISOString();
  return new Response(`Current time: ${currentTime}`, {
    headers: { "content-type": "text/plain" },
  });
};

await serve(handler, { port: 8000 });
```

### Tables

| Feature            | Deno          | JavaScript    |
| ------------------ | ------------- | ------------- |
| **Type Safety**    | ✅ TypeScript | ✅ TypeScript |
| **Performance**    | ⚡ Fast       | 🐌 Slower     |
| **Ecosystem**      | 📦 Modern     | 📦 Huge       |
| **Learning Curve** | 📈 Moderate   | 📈 Moderate   |

### Blockquotes

> This is a simple blockquote.

> This is a blockquote with **bold text** and `inline code`.

### Task Lists

- [x] Set up Deno project
- [x] Create basic web server
- [x] Add markdown support
- [ ] Implement WebSocket connections
- [ ] Add database integration

### Definition Lists

Term 1
: Definition 1 with **bold text** and `code`.

Term 2
: Definition 2 with _italic text_.

### Abbreviations

\_[HTML]: HyperText Markup Language
\_[CSS]: Cascading Style Sheets
\_[API]: Application Programming Interface

The HTML and CSS are used to style this page, while the API provides dynamic content.

### Footnotes

- **Fast startup times** - Deno starts up quickly[^1]
- **Type safety** - TypeScript provides excellent developer experience
- **Modern tooling** - Built-in formatter, linter, and test runner
- **Build-time caching** - Static content for optimal performance

[^1]: Deno's startup time is typically under 50ms, making it ideal for CLI tools and microservices.

---_This page demonstrates all major markdown features including headings, text formatting, lists, code blocks, tables, links, images, blockquotes, task lists, and footnotes!_