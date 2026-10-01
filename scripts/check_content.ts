import { dirname, extname, join, normalize, relative, sep } from "node:path";

export interface ContentIssue {
  file: string;
  message: string;
}

interface ParsedFrontmatter {
  fields: Record<string, string | string[]>;
  body: string;
  errors: string[];
}

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\([\\"'])/g, "$1");
  }
  return trimmed;
}

function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return {
      fields: {},
      body: content,
      errors: ["frontmatter block is missing or malformed"],
    };
  }

  const fields: Record<string, string | string[]> = {};
  const errors: string[] = [];
  for (const [index, line] of match[1].split(/\r?\n/).entries()) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!field) {
      errors.push(`malformed frontmatter line ${index + 1}`);
      continue;
    }
    const [, key, rawValue] = field;
    const value = rawValue.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      const contents = value.slice(1, -1).trim();
      fields[key] = contents
        ? contents.split(/,(?=(?:[^'\"]|'[^']*'|\"[^\"]*\")*$)/).map(
          parseScalar,
        ).filter(Boolean)
        : [];
    } else {
      fields[key] = parseScalar(value);
    }
  }
  return { fields, body: content.slice(match[0].length), errors };
}

function routeUrlForMarkdown(routesDir: string, file: string): string {
  const rel = relative(routesDir, file).split(sep).join("/").replace(
    /\.md$/i,
    "",
  );
  return rel === "index"
    ? "/"
    : rel.endsWith("/index")
    ? `/${rel.slice(0, -6)}`
    : `/${rel}`;
}

function localPathForLink(target: string, sourceUrl: string): string | null {
  const cleaned = target.trim().replace(/^<|>$/g, "");
  if (
    !cleaned || cleaned.startsWith("#") || cleaned.startsWith("//") ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(cleaned)
  ) return null;
  let pathPart: string;
  try {
    pathPart = decodeURIComponent(cleaned.split(/[?#]/, 1)[0]);
  } catch {
    return cleaned;
  }
  if (!pathPart) return null;
  if (pathPart.startsWith("/")) return normalize(pathPart).replace(/\\/g, "/");
  const sourceDirectory = dirname(sourceUrl).split(sep).join("/");
  return normalize(join(sourceDirectory, pathPart)).replace(/\\/g, "/");
}

async function exists(path: string): Promise<boolean> {
  try {
    const info = await Deno.stat(path);
    return info.isFile || info.isDirectory;
  } catch {
    return false;
  }
}

async function linkExists(
  rootDir: string,
  routePath: string,
): Promise<boolean> {
  if (routePath === "/rss.xml") return true;
  if (routePath === "/") {
    return await exists(join(rootDir, "routes", "index.md"));
  }
  const rel = routePath.replace(/^\/+/, "");
  if (rel === ".." || rel.startsWith("../")) return false;

  const candidates = [join(rootDir, rel)];
  if (rel === "assets" || rel.startsWith("assets/")) {
    candidates.push(join(rootDir, "assets", rel.slice("assets/".length)));
  } else {
    const routeRel = rel.replace(/\.html?$/i, "");
    candidates.push(join(rootDir, "routes", `${routeRel}.md`));
    candidates.push(join(rootDir, "routes", routeRel, "index.md"));
    candidates.push(join(rootDir, "routes", routeRel));
  }
  for (const candidate of candidates) {
    if (await exists(candidate)) return true;
  }
  return false;
}

function visibleMarkdown(content: string): string {
  return content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ");
}

async function collectMarkdown(dir: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) files.push(...await collectMarkdown(path));
    else if (entry.isFile && extname(entry.name).toLowerCase() === ".md") {
      files.push(path);
    }
  }
  return files;
}

export async function lintContent(rootDir: string): Promise<ContentIssue[]> {
  const routesDir = join(rootDir, "routes");
  const files = await collectMarkdown(routesDir);
  const issues: ContentIssue[] = [];
  for (const file of files) {
    const content = await Deno.readTextFile(file);
    const parsed = parseFrontmatter(content);
    const add = (message: string) =>
      issues.push({ file: relative(rootDir, file), message });
    for (const error of parsed.errors) add(error);

    for (const key of ["title", "date", "author", "tags"]) {
      if (
        !(key in parsed.fields) ||
        (typeof parsed.fields[key] === "string" && !parsed.fields[key].trim())
      ) {
        add(`Missing required frontmatter: ${key}`);
      }
    }
    if (typeof parsed.fields.tags === "string") {
      add("tags must be a YAML inline list");
    }
    if (
      typeof parsed.fields.date === "string" && parsed.fields.date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.fields.date) ||
        !Number.isFinite(Date.parse(`${parsed.fields.date}T00:00:00Z`)))
    ) {
      add("date must use YYYY-MM-DD format");
    }

    const sourceUrl = routeUrlForMarkdown(routesDir, file);
    const body = visibleMarkdown(parsed.body);
    const imagePattern = /!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+[^)]*)?\)/g;
    for (const match of body.matchAll(imagePattern)) {
      if (!match[1].trim()) add("Markdown image alt text is required");
    }

    const links = new Set<string>();
    const markdownLinkPattern = /!?\[[^\]]*\]\(\s*([^\s)]+)(?:\s+[^)]*)?\)/g;
    for (const match of body.matchAll(markdownLinkPattern)) links.add(match[1]);
    const htmlLinkPattern = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
    for (const match of body.matchAll(htmlLinkPattern)) links.add(match[2]);
    for (const link of links) {
      const localPath = localPathForLink(link, sourceUrl);
      if (localPath && !await linkExists(rootDir, localPath)) {
        add(`Broken local link: ${link}`);
      }
    }
  }
  return issues.sort((a, b) =>
    a.file.localeCompare(b.file) || a.message.localeCompare(b.message)
  );
}

function getRootDir(args: string[]): string {
  const rootIndex = args.indexOf("--root");
  if (rootIndex >= 0 && args[rootIndex + 1]) return args[rootIndex + 1];
  return new URL("../", import.meta.url).pathname;
}

if (import.meta.main) {
  const rootDir = getRootDir(Deno.args);
  try {
    const issues = await lintContent(rootDir);
    if (issues.length) {
      for (const issue of issues) {
        console.error(`${issue.file}: ${issue.message}`);
      }
      console.error(`Content lint failed with ${issues.length} issue(s).`);
      Deno.exit(1);
    }
    console.log("Content lint passed.");
  } catch (error) {
    console.error(
      `Content lint could not complete: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    Deno.exit(1);
  }
}
