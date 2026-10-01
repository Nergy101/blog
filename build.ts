#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { build } from "astrodon";
import {
  estimateReadingMinutes,
  getRelatedPosts,
} from "./assets/blog-features.js";

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
  tags: string[];
  readingMinutes: number;
}

function extractFrontmatter(
  content: string,
): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const [, yamlBlock, body] = match;
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlBlock.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value: unknown = line.slice(colon + 1).trim();
    if (
      typeof value === "string" &&
      (value.startsWith("[") || value.startsWith("{"))
    ) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        // keep as string
      }
    } else if (
      typeof value === "string" && value.startsWith('"') && value.endsWith('"')
    ) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

function firstParagraph(body: string, maxLen = 300): string {
  const noHeaders = body.replace(/^#+\s+.*$/gm, "").trim();
  const paragraph = noHeaders.split(/\n\n+/)[0]?.replace(/\n/g, " ").trim() ??
    "";
  const plain = paragraph.replace(/#{1,6}\s/g, "").replace(
    /\*\*([^*]+)\*\*/g,
    "$1",
  ).replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  const match = value.trim().match(/^\[([\s\S]*)\]$/);
  if (!match) return [];
  const contents = match[1].trim();
  if (!contents) return [];
  return contents
    .split(/,(?=(?:[^'\"]|'[^']*'|\"[^\"]*\")*$)/)
    .map((tag) => tag.trim().replace(/^(?:\"([\s\S]*)\"|'([\s\S]*)')$/, "$1$2"))
    .filter(Boolean);
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
  if (
    !entry.isFile || !entry.name.endsWith(".md") || entry.name === "index.md"
  ) continue;
  const path = `${blogsDir}/${entry.name}`;
  const content = await Deno.readTextFile(path);
  const { frontmatter, body } = extractFrontmatter(content);
  const title = String(frontmatter.title ?? entry.name.replace(/\.md$/, ""));
  const date = String(frontmatter.date ?? "");
  const author = String(frontmatter.author ?? "Christian / Nergy101");
  const slug = entry.name.replace(/\.md$/, "");
  const description = firstParagraph(body);
  const tags = parseTags(frontmatter.tags);
  const readingMinutes = estimateReadingMinutes(body);
  posts.push({ title, date, author, slug, description, tags, readingMinutes });
}

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const rssItems = posts
  .map(
    (p) =>
      `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${baseUrl}/blogs/${encodeURIComponent(p.slug)}</link>
    <guid isPermaLink="true">${baseUrl}/blogs/${
        encodeURIComponent(p.slug)
      }</guid>
    <pubDate>${toRfc822Date(p.date)}</pubDate>
    <author>${escapeXml(p.author)}</author>
    <description>${escapeXml(p.description)}</description>
  </item>`,
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

const browserPosts = posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  date: post.date,
  author: post.author,
  excerpt: post.description,
  tags: post.tags,
  readingMinutes: post.readingMinutes,
}));
await Deno.writeTextFile(
  `${distDir}/assets/blog-posts.json`,
  JSON.stringify(browserPosts, null, 2),
);

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]!);
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (char) =>
    ({
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029",
    })[char]!);
}

function createToc(html: string): string {
  const headings = [
    ...html.matchAll(/<h([23])\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi),
  ]
    .map((match) => ({
      level: Number(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim(),
    }))
    .filter((heading) =>
      heading.text && heading.text.toLocaleLowerCase() !== "table of contents"
    );
  if (!headings.length) return "";
  const items = headings.map((heading) =>
    `<li${
      heading.level === 3 ? ' class="post-toc-subheading"' : ""
    }><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`
  ).join("");
  return `<nav class="post-toc" aria-label="Table of contents"><h2>On this page</h2><ol>${items}</ol></nav>`;
}

function createRelatedPosts(current: BlogPost): string {
  const related = getRelatedPosts(current, posts, 3);
  const cards = related.map((post) => {
    const tags = post.tags.map((tag) =>
      `<span class="blog-card-tag">${escapeHtml(tag)}</span>`
    ).join("");
    return `<article class="blog-card"><a href="/blogs/${
      encodeURIComponent(post.slug)
    }" class="blog-card-link-wrapper"><div class="blog-card-header"><h3 class="blog-card-title">${
      escapeHtml(post.title)
    }</h3><div class="blog-card-meta"><span class="blog-card-date">${
      escapeHtml(post.date)
    }</span><span class="blog-card-author">by ${
      escapeHtml(post.author)
    }</span></div></div><p class="blog-card-excerpt">${
      escapeHtml(post.description)
    }</p><div class="blog-card-tags">${tags}</div></a></article>`;
  }).join("");
  return `<div class="container"><section id="related-posts" class="related-posts"><h2>Related posts</h2>${cards}</section></div>`;
}

const allTags = [...new Set(posts.flatMap((post) => post.tags))]
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
const archiveControls =
  `<div class="blog-archive-controls"><label for="blog-search">Search posts</label><input id="blog-search" type="search" placeholder="Search titles, topics, and tags" autocomplete="off"><label for="blog-tag-filter">Filter by tag</label><select id="blog-tag-filter"><option value="">All tags</option>${
    allTags.map((tag) =>
      `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`
    ).join("")
  }</select><p id="blog-result-count" aria-live="polite"></p><p id="blog-empty-state" hidden>No posts match your search. Try another term or tag.</p></div>`;

for (const htmlFile of htmlFiles) {
  const relativePath = htmlFile.slice(distDir.length + 1).replaceAll(
    "\\\\",
    "/",
  );
  let content = await Deno.readTextFile(htmlFile);
  if (relativePath === "blogs/index.html") {
    for (const post of posts) {
      const tagAttribute = escapeHtml(post.tags.join("|"));
      const original = `<div class="blog-card"> <a href="/blogs/${post.slug}"`;
      const replacement = `<div class="blog-card" data-blog-post="${
        escapeHtml(post.slug)
      }" data-tags="${tagAttribute}"> <a href="/blogs/${post.slug}"`;
      content = content.replace(original, replacement);
    }
    if (posts.length) {
      const firstCard = `<div class="blog-card" data-blog-post="${
        escapeHtml(posts[0].slug)
      }"`;
      content = content.replace(firstCard, `${archiveControls}${firstCard}`);
    }
  }

  const blogMatch = relativePath.match(/^blogs\/([^/]+)\.html$/);
  const currentPost = blogMatch && blogMatch[1] !== "index"
    ? posts.find((post) => post.slug === blogMatch[1])
    : undefined;
  if (currentPost) {
    const metadata = `<p class="post-reading-time"><time datetime="${
      escapeHtml(currentPost.date)
    }">${
      escapeHtml(currentPost.date)
    }</time> · ${currentPost.readingMinutes} min read</p>${createToc(content)}`;
    content = content.replace(
      /<h[1-6]\b[\s\S]*?<\/h[1-6]>/i,
      (heading) => `${heading}${metadata}`,
    );
    content = content.replace(
      "</main>",
      `${createRelatedPosts(currentPost)}</main>`,
    );
  }

  const scripts: string[] = [];
  if (relativePath === "blogs/index.html" || currentPost) {
    if (currentPost) {
      scripts.push(
        `<script id="blog-post-current" type="application/json">${
          safeJson(browserPosts.find((post) => post.slug === currentPost.slug))
        }</script>`,
      );
    }
    scripts.push(
      '<script type="module" src="/assets/blog-features.js"></script>',
    );
  }
  if (content.includes('class="github-release-feed"')) {
    scripts.push(
      '<script type="module" src="/assets/project-releases.js"></script>',
    );
  }
  if (scripts.length) {
    content = content.replace("</body>", `${scripts.join("\n")}\n</body>`);
  }
  await Deno.writeTextFile(htmlFile, content);
}
console.log("Added blog discovery, reading aids, and project release widgets");
