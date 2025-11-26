---
title: Astrodon - Markdown Showcase
date: 2025-01-15
author: Christian / Nergy101
tags: [astrodon, demo, markdown, ssg, ssr, deno]
---

## What is Astrodon?

Astrodon is a fast, modern static‑site generator for Deno that focuses on Markdown-first content creation.

- **Markdown‑first**: Write pages in plain `.md`
- **Optimized assets**: Automatic WebP conversion and caching
- **Simple usage**: `build()` to generate, `serve()` to host

---

## Markdown Showcase

Welcome to the comprehensive Astrodon demo page! This showcases **all the different markdown features** available in Astrodon.

---

## Text Formatting

Let's start with **bold text** and _italic text_. We can also use **_bold italic_** for emphasis.

~~Strikethrough text~~ shows deleted content, while `inline code` highlights technical terms.

### Subheadings and Lists

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

## Code Blocks

### TypeScript Example

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

## Tables

| Feature            | Deno          | JavaScript    |
| ------------------ | ------------- | ------------- |
| **Type Safety**    | ✅ TypeScript | ✅ TypeScript |
| **Performance**    | ⚡ Fast       | 🐌 Slower     |
| **Ecosystem**      | 📦 Modern     | 📦 Huge       |
| **Learning Curve** | 📈 Moderate   | 📈 Moderate   |

## Links and Images

Here are some useful links:

- [Deno Documentation](https://deno.land/manual)
- [Markdown Guide](https://www.markdownguide.org/)

![Project Logo](/assets/nemic-logos/logo.png)

## Blockquotes

> This is a simple blockquote.

> This is a blockquote with **bold text** and `inline code`.

Or multiple lines

> This is a blockquote. If the content is long enough, and its really needed,
> it can span multiple lines.

## Horizontal Rules

---

## Task Lists

- [x] Set up Deno project
- [x] Create basic web server
- [x] Add markdown support
- [ ] Implement WebSocket connections
- [ ] Add database integration

## Definition Lists

Term 1
: Definition 1 with **bold text** and `code`.

Term 2
: Definition 2 with _italic text_.

## Abbreviations

\_[HTML]: HyperText Markup Language
\_[CSS]: Cascading Style Sheets
\_[API]: Application Programming Interface

The HTML and CSS are used to style this page, while the API provides dynamic content.

## Performance Benefits

- **Fast startup times** - Deno starts up quickly[^1]
- **Type safety** - TypeScript provides excellent developer experience
- **Modern tooling** - Built-in formatter, linter, and test runner
- **Build-time caching** - Static content for optimal performance

[^1]: Deno's startup time is typically under 50ms, making it ideal for CLI tools and microservices.

## What's Next?

I'm excited to explore more advanced features like:

- WebSocket connections
- File system operations
- Database integrations
- Enhanced caching strategies

## Thanks for reading!

[Back to Home](/)

---

_This page demonstrates all major markdown features including headings, text formatting, lists, code blocks, tables, links, images, blockquotes, task lists, and footnotes!_
