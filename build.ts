#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { build } from "astrodon";

await build({
  contentDir: new URL("./routes", import.meta.url).pathname,
  outDir: new URL("./dist", import.meta.url).pathname,
  assetsDir: new URL("./assets", import.meta.url).pathname,
  componentsDir: new URL("./components", import.meta.url).pathname,
});

// Inject Umami analytics script into all HTML files
const distDir = new URL("./dist", import.meta.url).pathname;
const umamiScript =
  '<script defer src="https://umami.nergy.space/script.js" data-website-id="d3572366-bf4c-462c-8c3e-d3db77869836"></script>';

// Recursively find all HTML files in dist directory
async function findHtmlFiles(dir: string): Promise<string[]> {
  const htmlFiles: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      htmlFiles.push(...(await findHtmlFiles(fullPath)));
    } else if (entry.isFile && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
  return htmlFiles;
}

const htmlFiles = await findHtmlFiles(distDir);

// Inject script into each HTML file
for (const htmlFile of htmlFiles) {
  const content = await Deno.readTextFile(htmlFile);

  // Skip if script already exists to avoid duplicates
  if (content.includes("umami.nergy.space/script.js")) {
    continue;
  }

  // Insert the script before the closing </body> tag
  const updatedContent = content.replace("</body>", `${umamiScript}\n</body>`);

  await Deno.writeTextFile(htmlFile, updatedContent);
}
