import assert from "node:assert/strict";

async function createFixture(): Promise<string> {
  const root = await Deno.makeTempDir({ prefix: "blog-content-lint-" });
  await Deno.mkdir(`${root}/routes/blogs`, { recursive: true });
  await Deno.mkdir(`${root}/assets`, { recursive: true });
  await Deno.writeTextFile(`${root}/assets/cover.png`, "fixture");
  await Deno.writeTextFile(
    `${root}/routes/index.md`,
    "---\ntitle: Home\ndate: 2026-01-01\nauthor: Writer\ntags: [home]\n---\n\n[Blog](/blogs)\n",
  );
  await Deno.writeTextFile(
    `${root}/routes/blogs/index.md`,
    "---\ntitle: Blog\ndate: 2026-01-01\nauthor: Writer\ntags: [blog]\n---\n\n[Post](/blogs/valid)\n",
  );
  await Deno.writeTextFile(
    `${root}/routes/blogs/valid.md`,
    "---\ntitle: Valid post\ndate: 2026-01-01\nauthor: Writer\ntags: [test]\n---\n\n![Cover](/assets/cover.png)\n\n## Details {#details}\n\n[Section](#details)\n",
  );
  return root;
}

async function runCheck(root: string) {
  const script =
    new URL("../scripts/check_content.ts", import.meta.url).pathname;
  const result = await new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", script, "--root", root],
    stdout: "piped",
    stderr: "piped",
  }).output();
  return {
    code: result.code,
    output: new TextDecoder().decode(result.stdout) +
      new TextDecoder().decode(result.stderr),
  };
}

Deno.test("content lint accepts valid frontmatter, image alt text, and local links", async () => {
  const root = await createFixture();
  try {
    const result = await runCheck(root);
    assert.equal(result.code, 0, result.output);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("content lint reports missing metadata, image alt text, and broken local links", async () => {
  const root = await createFixture();
  try {
    await Deno.writeTextFile(
      `${root}/routes/blogs/invalid.md`,
      "---\ntitle: Invalid\ntags: not-a-list\n---\n\n![](/assets/missing.png)\n\n[Broken](/blogs/missing-post)\n",
    );
    const result = await runCheck(root);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Missing required frontmatter: date/);
    assert.match(result.output, /tags must be a YAML inline list/);
    assert.match(result.output, /image alt text is required/i);
    assert.match(result.output, /broken local link/i);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
