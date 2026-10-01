import { normalizeGitHubRelease } from "./blog-features.js";

export const RELEASE_REQUEST_TIMEOUT_MS = 4000;
const RELEASE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/** @param {unknown} value @param {string} repo */
export function parseCachedRelease(value, repo) {
  if (!value || typeof value !== "object") return null;
  const record = /** @type {{release?: unknown}} */ (value);
  const release = record.release;
  if (!release || typeof release !== "object") return null;
  const cached =
    /** @type {{name?: unknown, tagName?: unknown, url?: unknown, date?: unknown, body?: unknown}} */ (release);
  return normalizeGitHubRelease({
    name: cached.name,
    tag_name: cached.tagName,
    html_url: cached.url,
    published_at: cached.date,
    body: cached.body,
  }, repo);
}

/** @param {string} repo @param {typeof fetch} fetcher @param {number} timeoutMs */
export async function fetchLatestRelease(
  repo,
  fetcher = fetch,
  timeoutMs = RELEASE_REQUEST_TIMEOUT_MS,
) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  try {
    const response = await fetcher(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal,
      },
    );
    if (!response.ok) return null;
    const raw = await response.json();
    if (raw?.draft || raw?.prerelease) return null;
    return normalizeGitHubRelease(raw, repo);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function cacheKey(repo) {
  return `blog:github-release:${repo}`;
}

function readCache(repo) {
  try {
    const value = localStorage.getItem(cacheKey(repo));
    if (!value) return null;
    const record = JSON.parse(value);
    const release = parseCachedRelease(record, repo);
    return release ? { release, cachedAt: Number(record.cachedAt) || 0 } : null;
  } catch {
    return null;
  }
}

function writeCache(repo, release) {
  try {
    localStorage.setItem(
      cacheKey(repo),
      JSON.stringify({ release, cachedAt: Date.now() }),
    );
  } catch {
    // Storage may be unavailable or full; the page still has its static fallback.
  }
}

function renderRelease(section, release, cached) {
  const name = section.querySelector("[data-release-name]");
  const date = section.querySelector("[data-release-date]");
  const link = section.querySelector("[data-release-link]");
  const notes = section.querySelector("[data-release-notes]");
  const status = section.querySelector("[data-release-status]");
  if (name) name.textContent = release.name;
  if (date) {
    date.dateTime = release.date;
    date.textContent = new Date(release.date).toLocaleDateString(undefined, {
      dateStyle: "long",
    });
  }
  if (link) {
    link.href = release.url;
    link.textContent = `Read ${release.tagName} release notes on GitHub`;
  }
  if (notes) {
    const body = release.body.trim().slice(0, 4000);
    notes.textContent = body;
    notes.hidden = !body;
  }
  if (status) {
    status.textContent = cached
      ? "Showing the last available release from this browser's cache."
      : "Latest release details loaded from GitHub.";
  }
}

async function initializeProjectReleases() {
  for (
    const section of document.querySelectorAll(
      ".github-release-feed[data-github-repo]",
    )
  ) {
    const repo = section.dataset.githubRepo ?? "";
    const cached = readCache(repo);
    if (cached) renderRelease(section, cached.release, true);
    if (cached && Date.now() - cached.cachedAt < RELEASE_CACHE_TTL_MS) continue;

    const latest = await fetchLatestRelease(repo);
    if (latest) {
      writeCache(repo, latest);
      renderRelease(section, latest, false);
    } else if (!cached) {
      const status = section.querySelector("[data-release-status]");
      if (status) {
        status.textContent =
          "GitHub release details are temporarily unavailable; use the releases link below.";
      }
    }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => void initializeProjectReleases(),
      { once: true },
    );
  } else {
    void initializeProjectReleases();
  }
}
