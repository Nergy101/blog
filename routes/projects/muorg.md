---
title: Muorg
date: 2026-04-09
author: Christian / Nergy101
tags: [tauri, vue, rust, kotlin, android, typescript, desktop-app, music]
---

# 🎵 Muorg - The Music Organizer from Hell

A cross-platform app for organizing MP3 and FLAC music libraries, available on desktop, Android, and the web — and live at [muorg.nergy.space](https://muorg.nergy.space). A dense, keyboard-friendly, library-style UI - not a minimal player, but a serious tool for keeping your collection clean and consistent across every device.

> *Pronounced "Mu-Ork" - think of a Musical Ork who organizes your music.*

<div style="display:flex; align-items:center; gap:1.25rem; margin-top:1rem;">
  <img src="/assets/muorg/icon.svg" alt="Muorg icon" width="56">
  <div>
    <div><strong>Platforms:</strong> Desktop (macOS · Windows · Linux) · Android · Web · self-hosted server</div>
    <div><strong>Live Site:</strong> <a href="https://muorg.nergy.space">muorg.nergy.space</a></div>
    <div><strong>Docs Site:</strong> <a href="https://docs.muorg.nergy.space">docs.muorg.nergy.space</a></div>
    <div><strong>Source Code:</strong> <a href="https://github.com/Nergy101/Muorg">github.com/Nergy101/Muorg</a></div>
    <div><strong>Releases:</strong> <a href="https://github.com/Nergy101/Muorg/releases">github.com/Nergy101/Muorg/releases</a></div>
  </div>
</div>

## One product, four moving parts

Muorg is a single product made of a few components that share the same music library and metadata model. Run the desktop app on its own, or add the server to sync your library across every device.

<div class="feature-grid">
  <div class="feature-card">
    <h3>🖥️ Desktop app</h3>
    <p><strong>macOS · Windows · Linux</strong> — Tauri 2 + Vue 3 + Rust</p>
    <p>The flagship app. It bundles <strong>muorg-server</strong> as a sidecar, so it works fully offline in <strong>Local</strong> mode, or points at a remote server in <strong>Online</strong> mode.</p>
  </div>
  <div class="feature-card">
    <h3>🛰️ Server <span style="font-weight:normal">(API / backend)</span></h3>
    <p><strong>Rust + Axum REST API</strong></p>
    <p>The headless backend. Indexes your library into SQLite and exposes tracks, search, playlists, ratings, metadata editing, and audio/Chromecast streaming over HTTP. Self-host it with Docker on a NAS or home server — music can live on local disk or in any S3-compatible bucket (Hetzner Object Storage, Cloudflare R2, Backblaze B2, Wasabi, MinIO, AWS S3), or both at once. Every other client connects to it.</p>
  </div>
  <div class="feature-card">
    <h3>📱 Android app</h3>
    <p><strong>Kotlin + Jetpack Compose</strong></p>
    <p>A native mobile client with Media3/ExoPlayer playback, Retrofit for the API, Room for offline caching, and Chromecast support. Connects to muorg-server to browse, search, and play your library on the go.</p>
  </div>
  <div class="feature-card">
    <h3>🌐 Web client</h3>
    <p><strong>Vue 3 + Vite PWA</strong></p>
    <p>An installable browser UI served via nginx. Talks to the same muorg-server API, giving you full library access from any device without installing a native app.</p>
  </div>
</div>

## Self-hosting

Muorg is built to be self-hosted easily. The server and web client ship as ready-to-run Docker images — one `docker compose up` starts both:

- **muorg-server** → `http://<your-host>:7700`, **muorg-web** → `http://<your-host>:7800`
- Point it at local music folders, or index a library straight out of an **S3-compatible bucket** — Hetzner Object Storage, Cloudflare R2, Backblaze B2, Wasabi, MinIO, or AWS S3. Cloud tracks behave exactly like local ones (search, seeking, FLAC transcoding, cover art, Chromecast, metadata editing, backups), and local folders + buckets can coexist in one library
- Library metadata lives in a persistent SQLite database; audio streams over HTTP with optional transcoding
- The live instance at [muorg.nergy.space](https://muorg.nergy.space) runs exactly this setup

## Features

- **Library management** - Add folders (or drag-and-drop); Muorg scans for `.mp3` and `.flac` and builds a persistent catalog in SQLite. Rescan or remove folders from the sidebar. Hide/show folders; expand or collapse all groups.
- **Library view** - Table with album art, title, artist, album, year, duration, format, and path. Full-text search across title, artist, and album. Group by album or artist with collapsible headers. Multi-select (Ctrl+A) for bulk actions.
- **Metadata editor** - Edit title, artist, album, album artist, year, genre, track/disc number, and album art. **Bulk edit**: select multiple tracks and change only the fields you want - other fields stay per-track.
- **Smart Suggestions** - Define how your file paths are structured, then apply it to auto-fill tags from any track's path. Keeps tags consistent with your folder layout. Example patterns:
  - Artist / Album / TrackNumber - TrackTitle
  - Artist / Year - Album / TrackNumber - TrackTitle
  - Artist / TrackTitle
- **Playlists** - Create, rename, delete, and export playlists to M3U. Add tracks via context menu or drag-and-drop.
- **Queue & Playback** - Reorderable queue, shuffle, continuous playback, and a maximized player with full-screen album art tinted gradient.
- **Reports** - Sidebar panels for missing metadata, duplicate tracks, and missing album covers. Configurable and clickable to jump directly to the offending track.
- **Theming** - Auto (system), Dark, Light, Orkish (green), and DOOM. Fully configurable layout, column widths, and panel sizes - all persisted.
- **Keyboard-first** - Every major action has a shortcut. Ctrl+K opens the full key map.

## Screenshots

Main library view:

![Muorg library view](/assets/muorg/library.png)

Metadata editor with tag fields and album art:

![Muorg metadata editor](/assets/muorg/metadata.png)

Compact player bar and maximized full-screen player:

![Muorg player bar](/assets/muorg/player_small.png)

![Muorg maximized player](/assets/muorg/player_max.jpeg)

Theme settings and Smart Suggestions:

![Muorg theme settings](/assets/muorg/settings_theme.png)

Key map (Ctrl+K):

![Muorg key map](/assets/muorg/keymap.png)

**Web client (PWA)** — installable browser UI on mobile:

![Muorg web client library](/assets/muorg/web-library.jpg)

Album detail with track list and playback:

![Muorg web client album](/assets/muorg/web-album.jpg)

## Tech Stack

<div class="tech-stack">
  <div class="tech-item">
    <img src="/assets/techs/tauri.svg" alt="Tauri" class="tech-icon">
    <strong>Tauri 2</strong> - Rust-powered desktop shell; native installers for macOS, Windows, and Linux with auto-update support
  </div>
  <div class="tech-item">
    <img src="/assets/techs/vue.svg" alt="Vue" class="tech-icon">
    <strong>Vue 3</strong> - Component-based frontend running in the Tauri WebView
  </div>
  <div class="tech-item">
    <img src="/assets/techs/typescript.svg" alt="TypeScript" class="tech-icon">
    <strong>TypeScript</strong> - Typed frontend throughout; interfaces mirror Rust types
  </div>
  <div class="tech-item">
    <img src="/assets/techs/tailwindcss.svg" alt="Tailwind CSS" class="tech-icon">
    <strong>Tailwind CSS</strong> - Utility-first styling with theme-aware classes
  </div>
  <div class="tech-item">
    <img src="/assets/techs/pinia.svg" alt="Pinia" class="tech-icon">
    <strong>Pinia</strong> - State management for catalog, settings, and playlists
  </div>
  <div class="tech-item">
    <img src="/assets/techs/sqlite.svg" alt="SQLite" class="tech-icon">
    <strong>SQLite</strong> - Persistent catalog of tracks, roots, and playlists via Rust's rusqlite
  </div>
  <div class="tech-item">
    <img src="/assets/techs/rust.svg" alt="Rust" class="tech-icon">
    <strong>Rust</strong> - Backend logic: ID3 metadata (MP3), Vorbis/FLAC metadata, file scanning, and all 21 Tauri commands
  </div>
</div>

## CI/CD Status

<div class="badges">
  <a href="https://github.com/Nergy101/Muorg/actions/workflows/build.yml" target="_blank" rel="noopener">
    <img src="https://github.com/Nergy101/Muorg/actions/workflows/build.yml/badge.svg" alt="Build and Lint">
  </a>
  <a href="https://github.com/Nergy101/Muorg/releases" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/v/release/Nergy101/Muorg" alt="Latest Release">
  </a>
</div>

## Website

Live instance at [muorg.nergy.space](https://muorg.nergy.space) — the web client connected to a self-hosted muorg-server.

Full documentation (desktop, server, web & Android clients) at [docs.muorg.nergy.space](https://docs.muorg.nergy.space).

## Source Code

The project is open source and available on [GitHub](https://github.com/Nergy101/Muorg)
