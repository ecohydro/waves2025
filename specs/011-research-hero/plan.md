# Implementation Plan: Research hero
Date: 2026-09-18. Spec: [spec.md](spec.md).
## Summary
Replace the flat blue banner with a dark-blue introduction above an authentic panoramic river photograph. Separating copy and photography preserves both readability and image detail.
## Technical Context
Existing Next.js 14 / React / TypeScript / Tailwind; server component and next/image. No new storage, dependencies, or client interaction. Scope: src/app/research/page.tsx only.
## Constitution Check
Identity: existing wavesDarkBlue token and existing site photo. Evidence: observable alt text, no new factual claims. IA: existing h1 and routes retained. Recruiting: unchanged. Accessibility: solid contrast surface, meaningful alt, fluid text height, responsive crop, no animation; browser verify mobile/light/dark and enlarged text. Technical: optimized next/image with sizes, priority, fixed aspect region; existing checks. Pre/post-design gates pass. Full-site certification is not claimed.
## Project Structure
src/app/research/page.tsx; existing public/images/site/dryland_ecohydrology.jpg; specs/011-research-hero/.
## Workflow
Shared dirty branch retained instead of branch creation. Agent context already documents this unchanged stack; skip rewriting unrelated agent files. No deployment requested for this change.
