---
title: Muorg
date: 2026-04-09
author: Christian / Nergy101
tags: [tauri, vue, rust, typescript, desktop-app, music]
---

# 🎵 Muorg - The Music Organizer from Hell

A cross-platform desktop app for organizing MP3 and FLAC music libraries. Dense, keyboard-friendly, library-style UI - not a minimal player, but a serious tool for keeping your collection clean and consistent.

> *Pronounced "Mu-Ork" - think of a Musical Ork who organizes your music.*

<div style="display:flex; align-items:center; gap:1.25rem; margin-top:1rem;">
  <img src="/assets/muorg/icon.svg" alt="Muorg icon" width="56">
  <div>
    <div><strong>Platforms:</strong> macOS · Windows · Linux</div>
    <div><strong>Source Code:</strong> <a href="https://github.com/Nergy101/Muorg">github.com/Nergy101/Muorg</a></div>
    <div><strong>Releases:</strong> <a href="https://github.com/Nergy101/Muorg/releases">github.com/Nergy101/Muorg/releases</a></div>
  </div>
</div>

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

## Source Code

The project is open source and available on [GitHub](https://github.com/Nergy101/Muorg)
