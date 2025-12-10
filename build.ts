#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { build } from "astrodon";

await build({
  contentDir: new URL("./routes", import.meta.url).pathname,
  outDir: new URL("./dist", import.meta.url).pathname,
  assetsDir: new URL("./assets", import.meta.url).pathname,
  componentsDir: new URL("./components", import.meta.url).pathname,
});

// Inject Umami analytics script into index.html
const indexPath = new URL("./dist/index.html", import.meta.url).pathname;
const indexContent = await Deno.readTextFile(indexPath);
const umamiScript =
  '<script defer src="https://umami.nergy.space/script.js" data-website-id="d3572366-bf4c-462c-8c3e-d3db77869836"></script>';

// Insert the script before the closing </body> tag
const updatedContent = indexContent.replace(
  "</body>",
  `${umamiScript}\n</body>`
);
await Deno.writeTextFile(indexPath, updatedContent);
