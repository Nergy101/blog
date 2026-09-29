/** @typedef {{slug: string, title: string, excerpt: string, date: string, author: string, tags: string[], readingMinutes: number}} BlogPost */

/** @param {BlogPost[]} posts @param {string} query @param {string} tag */
export function filterBlogPosts(posts, query = "", tag = "") {
  const needle = query.trim().toLocaleLowerCase();
  const selectedTag = tag.trim().toLocaleLowerCase();
  return posts.filter((post) => {
    const text = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`
      .toLocaleLowerCase();
    return (!needle || text.includes(needle)) &&
      (!selectedTag ||
        post.tags.some((item) => item.toLocaleLowerCase() === selectedTag));
  });
}

/** @param {BlogPost} current @param {BlogPost[]} posts @param {number} limit */
export function getRelatedPosts(current, posts, limit = 3) {
  const currentTags = new Set(
    current.tags.map((tag) => tag.toLocaleLowerCase()),
  );
  const candidates = posts.filter((post) => post.slug !== current.slug);
  const score = (post) =>
    post.tags.reduce(
      (total, tag) =>
        total + (currentTags.has(tag.toLocaleLowerCase()) ? 1 : 0),
      0,
    );
  const matching = candidates.filter((post) => score(post) > 0);
  const ranked = (matching.length ? matching : candidates).sort((a, b) => {
    const bySharedTags = score(b) - score(a);
    if (bySharedTags) return bySharedTags;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return ranked.slice(0, Math.max(0, limit));
}

/** @param {string} markdown */
export function estimateReadingMinutes(markdown) {
  const readable = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]*>/g, " ");
  const words = readable.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / 200));
}

/** @param {any} raw @param {string} repo */
export function normalizeGitHubRelease(raw, repo) {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }
  const tagName = typeof raw.tag_name === "string" ? raw.tag_name : "";
  const name = typeof raw.name === "string" && raw.name.trim()
    ? raw.name.trim()
    : tagName;
  const date = typeof raw.published_at === "string" ? raw.published_at : "";
  const body = typeof raw.body === "string" ? raw.body : "";
  try {
    const url = new URL(raw.html_url);
    if (
      url.protocol !== "https:" || url.hostname !== "github.com" ||
      !url.pathname.startsWith(`/${repo}/releases/`) || !tagName || !name ||
      !Number.isFinite(Date.parse(date))
    ) return null;
    return { name, tagName, url: url.href, date, body };
  } catch {
    return null;
  }
}

/** @param {ReturnType<typeof normalizeGitHubRelease>} fresh @param {ReturnType<typeof normalizeGitHubRelease>} cached */
export function chooseCachedRelease(fresh, cached) {
  return fresh ?? cached ?? null;
}

function loadPosts() {
  if (window.blogPostsPromise) return window.blogPostsPromise;
  window.blogPostsPromise = fetch("/assets/blog-posts.json")
    .then((response) => response.ok ? response.json() : [])
    .catch(() => []);
  return window.blogPostsPromise;
}

function initArchive() {
  const search = document.querySelector("#blog-search");
  const tagFilter = document.querySelector("#blog-tag-filter");
  if (!search || !tagFilter) return;

  const cards = [...document.querySelectorAll("[data-blog-post]")];
  const cardPosts = cards.map((card) => ({
    slug: card.dataset.blogPost ?? "",
    title: card.querySelector(".blog-card-title")?.textContent ?? "",
    excerpt: card.querySelector(".blog-card-excerpt")?.textContent ?? "",
    date: card.querySelector(".blog-card-date")?.textContent ?? "",
    author: card.querySelector(".blog-card-author")?.textContent ?? "",
    readingMinutes: 1,
    tags: (card.dataset.tags ?? "").split("|").filter(Boolean),
  }));
  const emptyState = document.querySelector("#blog-empty-state");
  const count = document.querySelector("#blog-result-count");
  const update = () => {
    const matching = new Set(
      filterBlogPosts(cardPosts, search.value, tagFilter.value).map((post) =>
        post.slug
      ),
    );
    let visible = 0;
    for (const card of cards) {
      const matches = matching.has(card.dataset.blogPost ?? "");
      card.hidden = !matches;
      if (matches) visible++;
    }
    if (emptyState) emptyState.hidden = visible > 0;
    if (count) {
      count.textContent = `${visible} ${visible === 1 ? "post" : "posts"}`;
    }
  };
  search.addEventListener("input", update);
  tagFilter.addEventListener("change", update);
  update();
}

function initPostEnhancements() {
  const currentData = document.querySelector("#blog-post-current");
  if (!currentData) return;
  let current;
  try {
    current = JSON.parse(currentData.textContent ?? "{}");
  } catch {
    return;
  }
  if (!current?.slug) return;

  const container = document.querySelector("main .container");
  const h1 = container?.querySelector("h1");
  if (!container || !h1) return;

  let meta = container.querySelector(".post-reading-time");
  if (!meta) {
    meta = document.createElement("p");
    meta.className = "post-reading-time";
    const published = document.createElement("time");
    published.dateTime = current.date;
    published.textContent = current.date;
    meta.append(
      published,
      document.createTextNode(` · ${current.readingMinutes} min read`),
    );
    h1.insertAdjacentElement("afterend", meta);
  }

  const headings = document.querySelector(".post-toc")
    ? []
    : [...container.querySelectorAll("h2[id], h3[id]")]
      .filter((heading) =>
        heading.id &&
        heading.textContent.trim().toLocaleLowerCase() !== "table of contents"
      );
  if (headings.length) {
    const nav = document.createElement("nav");
    nav.className = "post-toc";
    nav.setAttribute("aria-label", "Table of contents");
    const title = document.createElement("h2");
    title.textContent = "On this page";
    const list = document.createElement("ol");
    for (const heading of headings) {
      const item = document.createElement("li");
      if (heading.tagName === "H3") item.className = "post-toc-subheading";
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      item.append(link);
      list.append(item);
    }
    nav.append(title, list);
    meta.insertAdjacentElement("afterend", nav);
  }

  void loadPosts().then((posts) => {
    if (!Array.isArray(posts)) return;
    const related = getRelatedPosts(current, posts, 3);
    if (!related.length || document.querySelector("#related-posts")) return;
    const section = document.createElement("section");
    section.id = "related-posts";
    section.className = "related-posts";
    const heading = document.createElement("h2");
    heading.textContent = "Related posts";
    section.append(heading);
    for (const post of related) {
      const card = document.createElement("article");
      card.className = "blog-card";
      const link = document.createElement("a");
      link.className = "blog-card-link-wrapper";
      link.href = `/blogs/${encodeURIComponent(post.slug)}`;
      const title = document.createElement("h3");
      title.className = "blog-card-title";
      title.textContent = post.title;
      const date = document.createElement("span");
      date.className = "blog-card-date";
      date.textContent = post.date;
      const excerpt = document.createElement("p");
      excerpt.className = "blog-card-excerpt";
      excerpt.textContent = post.excerpt;
      const tags = document.createElement("div");
      tags.className = "blog-card-tags";
      for (const tag of post.tags) {
        const badge = document.createElement("span");
        badge.className = "blog-card-tag";
        badge.textContent = tag;
        tags.append(badge);
      }
      link.append(title, date, excerpt, tags);
      card.append(link);
      section.append(card);
    }
    container.append(section);
  });
}

if (typeof document !== "undefined") {
  const initialize = () => {
    initArchive();
    initPostEnhancements();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}
