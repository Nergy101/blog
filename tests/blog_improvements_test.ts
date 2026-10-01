import assert from "node:assert/strict";

const read = (path: string) =>
  Deno.readTextFileSync(new URL(path, import.meta.url));

Deno.test("blog archive exposes search and tag filtering", () => {
  const html = Deno.readTextFileSync(
    new URL("../dist/blogs/index.html", import.meta.url),
  );
  assert.match(html, /id="blog-search"/);
  assert.match(html, /id="blog-tag-filter"/);
  assert.match(html, /data-blog-post=/);
});

Deno.test("blog posts show reading time, an automatic table of contents, and related posts", () => {
  const html = Deno.readTextFileSync(
    new URL("../dist/blogs/retro-ranker.html", import.meta.url),
  );
  assert.match(html, /class="post-reading-time"/);
  assert.match(html, /aria-label="Table of contents"/);
  assert.match(html, /id="related-posts"/);
});

Deno.test("every blog post receives reading-time metadata despite non-H1 source headings", () => {
  const posts = JSON.parse(
    Deno.readTextFileSync(
      new URL("../dist/assets/blog-posts.json", import.meta.url),
    ),
  ) as { slug: string }[];
  for (const post of posts) {
    const html = Deno.readTextFileSync(
      new URL(`../dist/blogs/${post.slug}.html`, import.meta.url),
    );
    assert.match(
      html,
      /class="post-reading-time"/,
      `missing metadata on ${post.slug}`,
    );
    assert.match(
      html,
      /id="related-posts"/,
      `missing related posts on ${post.slug}`,
    );
  }
});

Deno.test("landing page no longer promises an unavailable comment system", () => {
  const markdown = read("../routes/index.md");
  assert.doesNotMatch(markdown, /Leave comments on posts/);
  assert.match(markdown, /doesn't have an on-site comment system/i);
});

Deno.test("project pages provide resilient public GitHub release sections", () => {
  const html = Deno.readTextFileSync(
    new URL("../dist/projects/muorg.html", import.meta.url),
  );
  assert.match(html, /data-github-repo="Nergy101\/Muorg"/);
  assert.match(html, /class="github-release-fallback"/);
  assert.match(html, /assets\/project-releases\.js/);
});

Deno.test("CI runs the standalone content lint", async () => {
  const path = new URL(
    "../.github/workflows/content-lint.yml",
    import.meta.url,
  );
  const exists = await Deno.stat(path).then(() => true, () => false);
  assert.equal(exists, true, "content lint workflow must be checked into CI");
  const workflow = Deno.readTextFileSync(path);
  const config = read("../deno.json");
  assert.match(workflow, /deno task content:check/);
  assert.match(config, /scripts\/check_content\.ts/);
});
