import assert from "node:assert/strict";
import {
  fetchLatestRelease,
  parseCachedRelease,
} from "../assets/project-releases.js";

const sample = {
  name: "Muorg v2.0",
  tag_name: "v2.0",
  html_url: "https://github.com/Nergy101/Muorg/releases/tag/v2.0",
  published_at: "2026-09-01T12:00:00Z",
  body: "- Improved search\n- Fixed playback",
};

Deno.test("GitHub release fetch reads the public latest-release endpoint", async () => {
  let requested = "";
  const result = await fetchLatestRelease("Nergy101/Muorg", async (input) => {
    requested = String(input);
    return new Response(JSON.stringify(sample), {
      headers: { "content-type": "application/json" },
    });
  }, 50);
  assert.equal(
    requested,
    "https://api.github.com/repos/Nergy101/Muorg/releases/latest",
  );
  assert.equal(result?.tagName, "v2.0");
});

Deno.test("GitHub release requests time out without failing the page", async () => {
  const result = await fetchLatestRelease(
    "Nergy101/Muorg",
    (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("aborted", "AbortError")),
          { once: true },
        );
      }),
    1,
  );
  assert.equal(result, null);
});

Deno.test("cached public release data remains readable as an offline fallback", () => {
  const parsed = parseCachedRelease({
    cachedAt: 1,
    release: {
      name: sample.name,
      tagName: sample.tag_name,
      url: sample.html_url,
      date: sample.published_at,
      body: sample.body,
    },
  }, "Nergy101/Muorg");
  assert.equal(parsed?.name, sample.name);
  assert.equal(
    parseCachedRelease(
      { release: { ...sample, url: "https://evil.example/" } },
      "Nergy101/Muorg",
    ),
    null,
  );
});
