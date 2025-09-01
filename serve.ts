#!/usr/bin/env -S deno run --allow-read --allow-net --allow-run
import { serve } from "astrodon";

await serve({
  root: new URL("./dist", import.meta.url).pathname,
  port: 8000,
});
