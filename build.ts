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

// Generate RSS feed from blog posts
const routesDir = new URL("./routes", import.meta.url).pathname;
const blogsDir = `${routesDir}/blogs`;
const baseUrl = "https://blog.nergy.space";

interface BlogPost {
  title: string;
  date: string;
  author: string;
  slug: string;
  description: string;
}

function extractFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const [, yamlBlock, body] = match;
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlBlock.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value: unknown = line.slice(colon + 1).trim();
    if (typeof value === "string" && (value.startsWith("[") || value.startsWith("{"))) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        // keep as string
      }
    } else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

function firstParagraph(body: string, maxLen = 300): string {
  const noHeaders = body.replace(/^#+\s+.*$/gm, "").trim();
  const paragraph = noHeaders.split(/\n\n+/)[0]?.replace(/\n/g, " ").trim() ?? "";
  const plain = paragraph.replace(/#{1,6}\s/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822Date(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

const posts: BlogPost[] = [];
for await (const entry of Deno.readDir(blogsDir)) {
  if (!entry.isFile || !entry.name.endsWith(".md") || entry.name === "index.md") continue;
  const path = `${blogsDir}/${entry.name}`;
  const content = await Deno.readTextFile(path);
  const { frontmatter, body } = extractFrontmatter(content);
  const title = String(frontmatter.title ?? entry.name.replace(/\.md$/, ""));
  const date = String(frontmatter.date ?? "");
  const author = String(frontmatter.author ?? "Christian / Nergy101");
  const slug = entry.name.replace(/\.md$/, "");
  const description = firstParagraph(body);
  posts.push({ title, date, author, slug, description });
}

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const rssItems = posts
  .map(
    (p) =>
      `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${baseUrl}/blogs/${encodeURIComponent(p.slug)}</link>
    <guid isPermaLink="true">${baseUrl}/blogs/${encodeURIComponent(p.slug)}</guid>
    <pubDate>${toRfc822Date(p.date)}</pubDate>
    <author>${escapeXml(p.author)}</author>
    <description>${escapeXml(p.description)}</description>
  </item>`
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nergy101 Blog</title>
    <link>${baseUrl}</link>
    <description>Technology, development, and software engineering from Christian / Nergy101.</description>
    <language>en-us</language>
    <lastBuildDate>${toRfc822Date(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;

await Deno.writeTextFile(`${distDir}/rss.xml`, rss);
console.log("Generated rss.xml");
