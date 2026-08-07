---
title: FitnessTracker
date: 2025-07-24
lastUpdated: 2026-08-07
author: Christian / Nergy101
tags: [react, typescript, python, fastapi, sqlite, tailwindcss, docker, pwa, fitness, health]
---

# 💪 FitnessTracker — Your Complete Fitness Companion

A privacy-first Progressive Web App for tracking workouts, runs, walks, boxing, body metrics, and daily wellness — all stored on your own server. No accounts, no cloud, no third-party data sharing.

> *Install it on any device. It works offline, syncs when you're back, and looks great in light or dark mode.*

<div style="display:flex; align-items:center; gap:1.25rem; margin-top:1rem;">
  <img src="/assets/fitness-tracker/icon.png" alt="FitnessTracker icon" width="56" style="border-radius:12px">
  <div>
    <div><strong>Live:</strong> <a href="https://fit.nergy.space">fit.nergy.space</a></div>
    <div><strong>Source Code:</strong> <a href="https://github.com/Nergy101/fitness-tracker">github.com/Nergy101/fitness-tracker</a></div>
    <div><strong>Platforms:</strong> iOS · Android · Desktop (PWA, installable everywhere)</div>
  </div>
</div>

## Who it's for

FitnessTracker is for **anyone who wants to take their fitness seriously** without handing their data to a third-party service. No subscription fees, no ads, no accounts — just you, your browser, and a lightweight server you control.

- **Home gym users** — track bodyweight, dumbbell, and flexibility workouts with 195 pre-loaded exercises (37 cardio, 116 strength, 42 flexibility)
- **Runners & walkers** — log runs and walks with distance, duration, and pace, with stats over time
- **Boxers** — log sessions with rounds, kcal/min, and notes; monthly breakdowns and PRs
- **Weight watchers** — chart your weight journey with goal tracking and BMI calculation
- **Wellness-minded people** — daily mood, energy, sleep, and stress check-ins with 8-week trends
- **Privacy-conscious fitness enthusiasts** — everything stays on your server; export/backup anytime

## What it can do

<div class="feature-grid">
  <div class="feature-card">
    <h3>🏋️ Workouts</h3>
    <p><strong>195 exercises</strong> across cardio, strength, and flexibility — 5 circuit templates (Basic, Calisthenics, Beginner Calisthenics, Cardio, Dumbbells), Tabata mode with fixed 20s/10s intervals, configurable rounds, warmup/cooldown phases, and a full-screen workout runner with progress ring, audio cues, and text-to-speech.</p>
  </div>
  <div class="feature-card">
    <h3>🏃 Run & Walk Tracking</h3>
    <p>Log runs and walks with distance, duration, pace, and randomized note prompts. Stats show total distance, best pace, and average pace over time.</p>
  </div>
  <div class="feature-card">
    <h3>🥊 Boxing Tracking</h3>
    <p>Log boxing sessions with duration, rounds, kcal/min, and notes. Track total sessions, hours, kcal, personal records, and monthly breakdowns with trend charts.</p>
  </div>
  <div class="feature-card">
    <h3>📊 History & Stats</h3>
    <p>Session history with date range filters, activity-colored cards, weekday bar chart, and a GitHub-style contribution heatmap. JSON import/export of all your sessions. Streak tracking with total sessions, hours, and calories burned.</p>
  </div>
  <div class="feature-card">
    <h3>⚖️ Health & Wellness</h3>
    <p>Weight tracking with goal progress bars and BMI calculator. Personal records across weight, measurements, performance, runs, walks, and boxing. Body measurements (waist, hips, chest, arms, thighs, neck) with before/after deltas. Daily wellness check-ins — mood, energy, stress, sleep hours — with 8-week trend charts. Health score (0–100) combining BMI, workout consistency, streak, and measurements.</p>
  </div>
  <div class="feature-card">
    <h3>🍎 Apple Health Import</h3>
    <p>Import your Apple Health export ZIP — workouts and health metrics are automatically parsed and added to your history, with a Workout Intensity scatter chart. No manual data entry needed if you're coming from an Apple Watch.</p>
  </div>
  <div class="feature-card">
    <h3>📱 PWA & Offline</h3>
    <p>Installable on iOS, Android, and desktop. Works offline with service worker precaching. Push notification support via Web Push API. Swipe navigation, light/dark theme, audio mute, and selectable date format (D/M or M/D).</p>
  </div>
</div>

## Screenshots

Workout tab with quick-log cards and templates:

![FitnessTracker workout tab](/assets/fitness-tracker/workout.jpg)

Full-screen workout runner with exercise image, progress ring, and timer:

![FitnessTracker workout runner](/assets/fitness-tracker/runner.jpg)

Exercise library with search and category filters:

![FitnessTracker exercises](/assets/fitness-tracker/exercises.jpg)

History with filters, activity chart, and session cards:

![FitnessTracker history](/assets/fitness-tracker/history.png)

Health dashboard with streaks, weight logging, and personal records:

![FitnessTracker health](/assets/fitness-tracker/health.png)

Stats dashboard with training mix and daily charts:

![FitnessTracker stats](/assets/fitness-tracker/stats.png)

## Tech Stack

<div class="tech-stack">
  <div class="tech-item">
    <img src="/assets/techs/react.svg" alt="React" class="tech-icon">
    <strong>React 19 + TypeScript</strong> — Modern component-based UI with full type safety
  </div>
  <div class="tech-item">
    <img src="/assets/techs/vite.svg" alt="Vite" class="tech-icon">
    <strong>Vite</strong> — Lightning-fast build tool with HMR for development
  </div>
  <div class="tech-item">
    <img src="/assets/techs/tailwindcss.svg" alt="Tailwind CSS" class="tech-icon">
    <strong>Tailwind CSS v4</strong> — Utility-first styling with CSS variable-driven theme system
  </div>
  <div class="tech-item">
    <img src="/assets/techs/fastapi.svg" alt="FastAPI" class="tech-icon">
    <strong>FastAPI + Python</strong> — High-performance async REST API with auto-generated OpenAPI docs
  </div>
  <div class="tech-item">
    <img src="/assets/techs/sqlite.svg" alt="SQLite" class="tech-icon">
    <strong>SQLAlchemy + SQLite</strong> — ORM with Alembic migrations for safe schema evolution
  </div>
  <div class="tech-item">
    <img src="/assets/techs/docker.svg" alt="Docker" class="tech-icon">
    <strong>Docker Compose</strong> — One-command deploy with Nginx reverse proxy, multi-arch builds
  </div>
  <div class="tech-item">
    <img src="/assets/techs/nodejs.svg" alt="Node.js" class="tech-icon">
    <strong>Playwright + Vitest</strong> — End-to-end browser tests + unit tests (258 backend, 122 frontend, 38 E2E)
  </div>
</div>

## CI/CD

Every push to `main` triggers a full pipeline: lint → unit tests (backend + frontend) → E2E (Playwright) → Docker multi-arch build & push to GHCR → auto-deploy to the VPS via SSH.

<div class="badges">
  <a href="https://github.com/Nergy101/fitness-tracker/actions/workflows/docker-publish.yml" target="_blank" rel="noopener">
    <img src="https://github.com/Nergy101/fitness-tracker/actions/workflows/docker-publish.yml/badge.svg" alt="CI/CD">
  </a>
</div>

## Why I built it

I wanted a fitness tracker that didn't require an account, didn't sell my data, and worked on every device I own. Most fitness apps lock your data behind a subscription or push you into a specific ecosystem. FitnessTracker is the opposite: self-hosted, privacy-first, and fully open source. Your data lives in a SQLite file you can back up, export, or inspect anytime.

## Source Code

The project is open source and available on [GitHub](https://github.com/Nergy101/fitness-tracker)
