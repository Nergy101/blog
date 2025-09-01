---
title: Astrodon
date: 2025-09-01
author: Christian / Nergy101
tags: [deno, static-site, markdown, lua]
---

# 🌌 Astrodon

A fast, modern static site generator built with Deno. Features Lua interpolation, dynamic content generation, and optimized build performance.

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

## Features

- **Markdown Processing**: Advanced markdown parsing with custom extensions
- **Lua Integration**: Dynamic content generation with Lua scripting
- **Asset Optimization**: Automatic WebP conversion and optimization
- **Fast Builds**: Intelligent caching and parallel processing
- **Modern Output**: Clean, semantic HTML with responsive design

## Tech Stack

- **Runtime**: Deno
- **Language**: TypeScript
- **Scripting**: Lua
- **Styling**: Custom CSS with CSS variables
- **Build System**: Custom build pipeline

## Key Benefits

- **Zero Dependencies**: No npm packages required
- **Fast Development**: Hot reloading and instant builds
- **Flexible**: Custom Lua scripts for dynamic content
- **Optimized**: Automatic image optimization and caching
