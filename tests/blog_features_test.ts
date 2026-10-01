import assert from "node:assert/strict";
import {
  chooseCachedRelease,
  estimateReadingMinutes,
  filterBlogPosts,
  getRelatedPosts,
  normalizeGitHubRelease,
} from "../assets/blog-features.js";

const posts = [
  {
    slug: "one",
    title: "Deno Fresh",
    excerpt: "Fast static sites",
    date: "2026-01-01",
    author: "Writer",
    readingMinutes: 2,
    tags: ["Deno", "web"],
  },
  {
    slug: "two",
    title: "Rust tools",
    excerpt: "Backend notes",
    date: "2025-01-01",
    author: "Writer",
    readingMinutes: 2,
    tags: ["Rust", "web"],
  },
  {
    slug: "three",
    title: "Deno testing",
    excerpt: "Browser automation",
    date: "2024-01-01",
    author: "Writer",
    readingMinutes: 2,
    tags: ["deno", "testing"],
  },
  {
    slug: "four",
    title: "CSS guide",
    excerpt: "Styles",
    date: "2023-01-01",
    author: "Writer",
    readingMinutes: 2,
    tags: ["css"],
  },
];

Deno.test("archive filtering searches text and matches tags case-insensitively", () => {
  assert.deepEqual(filterBlogPosts(posts, "fresh", ""), [posts[0]]);
  assert.deepEqual(filterBlogPosts(posts, "", "DENO"), [posts[0], posts[2]]);
  assert.deepEqual(filterBlogPosts(posts, "backend", "rust"), [posts[1]]);
});

Deno.test("related posts rank shared tags, exclude the current post, and respect the limit", () => {
  assert.deepEqual(getRelatedPosts(posts[0], posts, 2), [posts[1], posts[2]]);
  assert.deepEqual(
    getRelatedPosts(posts[3], posts, 2).map((post) => post.slug),
    ["one", "two"],
  );
});

Deno.test("reading time ignores fenced code and rounds up at 200 words per minute", () => {
  const text = `${"word ".repeat(401)}\n\n\`\`\`ts\n${
    "code ".repeat(800)
  }\n\`\`\``;
  assert.equal(estimateReadingMinutes(text), 3);
  assert.equal(estimateReadingMinutes(""), 1);
});

Deno.test("GitHub release parsing accepts only safe URLs for the configured repository", () => {
  assert.equal(
    normalizeGitHubRelease({
      name: "v1.2.0",
      tag_name: "v1.2.0",
      html_url: "https://github.com/Nergy101/Muorg/releases/tag/v1.2.0",
      published_at: "2026-09-01T12:00:00Z",
      body: "Bug fixes",
    }, "Nergy101/Muorg")?.name,
    "v1.2.0",
  );
  assert.equal(
    normalizeGitHubRelease({
      name: "bad",
      tag_name: "bad",
      html_url: "https://evil.example/",
      published_at: "2026-09-01T12:00:00Z",
      body: "",
    }, "Nergy101/Muorg"),
    null,
  );
});

Deno.test("stale cached release remains the fallback when GitHub is unavailable", () => {
  const cached = {
    name: "v1.0",
    tagName: "v1.0",
    url: "https://github.com/Nergy101/Muorg/releases/tag/v1.0",
    date: "2026-01-01",
    body: "Old notes",
  };
  assert.equal(chooseCachedRelease(null, cached), cached);
  assert.equal(
    chooseCachedRelease({ ...cached, name: "v2.0" }, cached)?.name,
    "v2.0",
  );
});
