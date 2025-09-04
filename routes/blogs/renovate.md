---
title: Renovate
date: 2025-09-04
author: Christian / Nergy101
tags: [dependencies, renovate, devops]
---

# Let's Renovate your software dependencies

In a large team, a lot gets built. The question is: will everything that gets built also get proper maintenance? Keeping dependencies up-to-date is one of the highest ROI activities you can automate. This post shows how I use Renovate to keep projects healthy without turning dependency updates into a full‑time job.

## What is Renovate?

[Renovate](https://docs.renovatebot.com/) is a bot that scans your repositories, detects outdated dependencies, and creates pull requests with version bumps and changelogs. It supports many ecosystems (npm, NuGet, Docker, GitHub Actions, Terraform, Bicep, etc.) and can be run as a GitHub App, a self-hosted Docker container, or inside CI (e.g., Azure DevOps, GitHub Actions).

Key things I like:

- Automated PRs with helpful titles and release notes (when GitHub tokens are configured)
- Smart grouping (e.g., group non‑breaking updates, keep majors separate)
- Auto-merge for safe updates **once checks pass**
- Custom schedules so updates arrive when your team can handle them
- Wide ecosystem support across backend, frontend, infra, and pipelines

## How to use Renovate?

There are two common setups I have worked with:

- GitHub: install the official Renovate GitHub App (simplest, lowest friction)
- Azure DevOps: run Renovate in a pipeline on a schedule

On how renovate and it's PR groupings work, its good to start with how Semantic Versioning (SemVer) works.

### Semantic Versioning

SemVer follows the pattern MAJOR.MINOR.PATCH:

- MAJOR: breaking changes
- MINOR: new features, backwards compatible
- PATCH: bug fixes

Common version range operators (npm-style) and what they allow:

- `^1.2.3` → allow `1.x.x` (no major bumps)
- `~1.2.3` → allow `1.2.x` (patch-only)
- `1.2.x` → allow any patch of 1.2
- `1.x` → allow any minor/patch of 1

NuGet-style ranges (C#) and what they allow:

- `[1.2.3]` → exactly `1.2.3`
- `[1.2.3, 2.0.0)` → `>= 1.2.3` and `< 2.0.0`
- `(1.2.3, 2.0.0]` → `> 1.2.3` and `<= 2.0.0`
- `(1.2.3, )` → `> 1.2.3`
- `[1.2.3, )` → `>= 1.2.3`
- `(, 2.0.0)` → `< 2.0.0`
- `(, 2.0.0]` → `<= 2.0.0`
- `1.2.*` → latest `1.2.x` (floating patch)
- `1.*` → latest `1.x` (floating minor)

Notes:

- Pre‑1.0.0 packages can treat MINOR as breaking. Renovate respects this nuance when deciding what is “safe”.
- Lockfiles (e.g., `package-lock.json`, `pnpm-lock.yaml`) pin exact versions. Renovate updates these lockfiles too, so CI stays reproducible.

### Getting Started

Create a `renovate.json` in the repository root. Here is a battle-tested baseline that mirrors how I like to structure PRs for frontend, backend, and infra:

```json
{
  {
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "platform": "azure",

  "automerge": true,
  "automergeType": "pr",
  "automergeStrategy": "merge-commit",
  "groupName": "other packages for non-breaking versions",

  "separateMajorMinor": false,

  "nuget": {
    "enabled": true
  },

  "prHourlyLimit": 0,

  "ignorePaths": ["**/node_modules/**", "**/bower_components/**"],

  "packageRules": [
    {
      "matchManagers": ["npm"],
      "groupName": "npm packages for non-breaking versions",
      "description": "npm packages for non-breaking versions"
    },

    {
      "matchManagers": ["nuget"],
      "groupName": "nuget packages for non-breaking versions",
      "description": "nuget packages for non-breaking versions"
    },

    {
      "matchManagers": ["npm"],
      "rangeStrategy": "bump"
    },

    {
      "matchManagers": ["npm"],
      "matchCurrentValue": "/^[^^~]/",
      "groupName": "Breaking updates npm",
      "description": "Consider pinned package updates breaking"
    },

    {
      "matchManagers": ["npm"],
      "matchCurrentValue": "/^\\~/",
      "matchUpdateTypes": ["minor"],
      "groupName": "Breaking updates npm",
      "description": "Consider minor updates to range versions with a patch range (~) breaking"
    },

    {
      "matchManagers": ["nuget"],
      "matchCurrentVersion": "<1.0.0",
      "groupName": "Breaking updates nuget",
      "description": "Consider updates to packages in beta (version<1.0.0) breaking"
    },

    {
      "matchManagers": ["nuget"],
      "matchPackageNames": ["/My\\.Company/"],
      "groupName": "My.Company package updates nuget",
      "description": "My.Company packages"
    },

    {
      "matchManagers": ["nuget"],
      "matchUpdateTypes": ["major"],
      "groupName": "Breaking updates nuget",
      "description": "Consider major version updates breaking"
    },

    {
      "matchManagers": ["npm"],
      "matchUpdateTypes": ["major"],
      "groupName": "Breaking updates npm",
      "description": "Consider major version updates breaking"
    }
  ]
}

```

This yields small, predictable PRs for non‑breaking updates (often auto‑merged once checks pass), while majors are isolated for deliberate review.

### GitHub

The easiest path is the official GitHub App.

1. Install the Renovate GitHub App for your org or user.
2. Select repositories to enable.
3. Add the `renovate.json` shown above to your repository.
4. Commit and push. The bot will open an onboarding PR; merge it to start.

Tips:

- If you want auto-merge, ensure required status checks exist and are green.
- Use labels/groups to match your team’s ownership model.

### DevOps

For Azure DevOps, I like to run Renovate via a scheduled pipeline. This uses the built-in `System.AccessToken` so you don’t have to manage a personal token. Ensure “Allow scripts to access the OAuth token” is enabled on the pipeline.

```yaml
trigger: none

schedules:
  - cron: "0 3 * * 1" # Every Monday at 03:00
    displayName: Weekday mornings
    always: true
    branches:
      include: [main]

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    persistCredentials: true

  - task: NodeTool@0
    inputs:
      versionSpec: "20.x"

  - script: |
      git config --global user.email 'noreply-bot@example.com'
      git config --global user.name 'Project Collection Build Service (Org-Project)'

      npm install -g renovate@latest
      npx --userconfig $(Build.SourcesDirectory)/.npmrc renovate
    env:
      LOG_FILE: "renovate-log"
      TOKEN: $(System.AccessToken)
    workingDirectory: renovate
    displayName: "Run Renovate"
```

#### Authenticating to private feeds (npm and NuGet)

For private registries, provide credentials via config files and environment variables.

- Note: In Azure DevOps pipelines, authentication to private feeds can be injected automatically (no tokens/passwords needed in `.npmrc`/`NuGet.Config`). Ensure the pipeline has access to the feeds and OAuth token access is enabled (or use dedicated authenticate tasks). You must still include the private feed references (registries/scopes/URLs) in these files so tools know where to resolve packages.

- npm: add a root-level `.npmrc` and ensure the token env var is available in the pipeline step (the example above passes a token via environment variables).

```ini
registry=https://registry.npmjs.org/
@my-scope:registry=https://pkgs.example.com/org/_packaging/my-feed/npm/registry/
always-auth=true
//pkgs.example.com/org/_packaging/my-feed/npm/registry/:_authToken=${NPM_TOKEN}
```

- NuGet: add a root-level `NuGet.Config` for restores, and/or configure Renovate `hostRules` (as shown below) so Renovate can fetch metadata from private feeds.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="PrivateFeed" value="https://pkgs.example.com/ORG/PROJECT/_packaging/FEED/nuget/v3/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <PrivateFeed>
      <add key="Username" value="token" />
      <add key="ClearTextPassword" value="${NUGET_TOKEN}" />
    </PrivateFeed>
  </packageSourceCredentials>
</configuration>
```

Use placeholder values (`example.com`, `ORG`, `PROJECT`, `FEED`, `@my-scope`) and set `NPM_TOKEN`/`NUGET_TOKEN` securely via your pipeline’s secret variables.

#### Required `config.js` (self‑hosted)

When running Renovate in CI or Docker (i.e., not via the GitHub App), provide a root‑level `config.js` or pass `--config-file` to point to it. Minimal example for the Azure DevOps setup above:

```js
//* Renovate config for Azure DevOps - Example (generic placeholders)
//* Add config.js for renovate: https://docs.renovatebot.com/modules/platform/azure/#create-a-configjs-file
module.exports = {
  platform: "azure",
  endpoint: "https://dev.azure.com/your-org/",
  token: process.env.TOKEN,
  labels: ["renovate", "dependencies"],
  hostRules: [
    // Azure Artifacts NuGet
    {
      hostType: "nuget",
      matchHost: "pkgs.dev.azure.com",
      username: "ignored-for-azure",
      password: process.env.TOKEN,
    },

    // Azure Artifacts npm
    {
      hostType: "npm",
      matchHost: "pkgs.dev.azure.com",
      username: "ignored-for-azure",
      password: process.env.TOKEN,
    },
  ],
  repositories: ["PROJECT/REPO"], // Azure DevOps: "Project/Repo"
};
```

- Keep repo‑specific rules in `renovate.json` (shown earlier).
- For GitHub, use `platform: 'github'` and replace `token` with `token: process.env.GITHUB_TOKEN` based on the env variables.
- For Azure DevOps Server, use `platform: 'azure'`, and add `endpoint`.

Notes:

- The `process.env.Token` comes from `$(System.AccessToken)`; make sure the pipeline has permission to access the repo and open PRs.
- If you prefer containers, replace the Bash step with `docker run renovate/renovate` and pass the same env vars.

## My PR Preferences

- Auto-complete turned on
- Provide a work-item to link if applicable (some teams have a 'maintenance' item, or create a new item every sprint)
- Per project; 4 package rules + extra's
  - Backend dependencies non-breaking
  - Backend dependencies breaking
  - Frontend dependencies non-breaking
  - Frontend dependencies breaking
  - Extra's: Bicep/Terraform/Github Actions
  - Extra's: My.Company.\* dependencies

How this maps to `renovate.json`:

- Non‑breaking updates are grouped per ecosystem: "npm packages for non‑breaking versions" and "nuget packages for non‑breaking versions", and will auto‑merge once checks pass. NPM uses `rangeStrategy: "bump"`.
- Breaking updates are isolated into "Breaking updates npm" and "Breaking updates nuget". Majors go here by default; pinned NPM deps and `~`‑ranged minors are treated as breaking; NuGet pre‑1.0 updates are treated as breaking.
- Internal NuGet packages matching `My.Company` get a dedicated group: "My.Company package updates nuget".
- Global auto‑merge is enabled (`automerge: true`) with merge commits (`automergeType: "pr"`, `automergeStrategy: "merge-commit"`).
- Operational: runs on Azure DevOps (`platform: "azure"`), no PR rate limit (`prHourlyLimit: 0`), and common folders are ignored (`node modules`, `bower components`).
- In total that should make 4-6 PRs at a time for the configured repository.

Final tips:

- Start conservative, then turn on auto‑merge for low-risk groups once you trust the flow.
- Keep CI fast and reliable—Renovate is only as smooth as your test signal.
- Use schedules to avoid a Monday PR flood or weekend noise.
