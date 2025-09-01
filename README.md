# Blog — Example site built with Astrodon

This repository is an example static site that uses the Astrodon framework. It demonstrates how to structure content, run builds, serve locally, and leverage Lua-powered interpolation within Markdown.

## How this blog uses Astrodon

- **Library usage**: See `build.ts` and `serve.ts`, which import `build` and `serve` from `astrodon`.
- **Content**: All pages live under `routes/` as Markdown files with YAML frontmatter.
- **Lua interpolation**: Markdown can include `{{lua:...}}` expressions resolved by Astrodon (e.g., `{{lua:current_time:friendly}}`).
- **Assets**: Static assets are under `assets/` and copied to `dist/` on build.

## Run locally

1. Ensure Deno is installed.
2. Build the site:

   ```bash
   deno run -A build.ts
   ```

3. Serve the built site:

   ```bash
   deno run -A serve.ts
   ```

4. Open `http://localhost:8000`.

## Project structure (excerpt)

```
blog/
├── routes/                # Markdown content with frontmatter and optional Lua
├── assets/                # Static assets
├── dist/                  # Build output (generated)
├── build.ts               # Uses Astrodon.build
├── serve.ts               # Uses Astrodon.serve
└── deno.json              # Import map, tasks
```

## Notes

- For more details on the framework itself, see the Astrodon README in the framework repo.
- Image optimization and performance benchmarking are optional; enable them as needed.
