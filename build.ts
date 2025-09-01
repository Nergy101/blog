#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { build } from "astrodon";

await build({
  contentDir: new URL("./routes", import.meta.url).pathname,
  outDir: new URL("./dist", import.meta.url).pathname,
  assetsDir: new URL("./assets", import.meta.url).pathname,
  componentsDir: new URL("./components", import.meta.url).pathname,
});
