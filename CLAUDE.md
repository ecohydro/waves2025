# waves2025 Development Guidelines

## Canonical project guidance

Read [AGENTS.md](AGENTS.md) and the [WAVES Site Constitution](.specify/memory/constitution.md) before work. They govern brand, voice, content integrity, accessibility, and engineering standards and take precedence over conflicting generated or legacy notes below. Keep policy in those canonical files rather than duplicating it here.

Auto-generated from all feature plans. Last updated: 2026-03-10

## Active Technologies
- TypeScript 5 / React 18.2 / Next.js 14.2 (App Router) + `@sanity/client`, `@sanity/image-url`, Tailwind CSS 3.4 (002-people-page-content)
- Sanity CMS (hosted, GROQ queries) (002-people-page-content)
- TypeScript 5 / Node.js (tsx runner for scripts) + `@sanity/client` (CMS reads/writes), Next.js 14.2 (App Router), Vitest (testing) (004-fix-social-links)

- TypeScript 5 / React 18.2 / Next.js 14.2 (App Router) + Tailwind CSS 3.4, Sanity CMS client, styled-components (001-uc-accessibility)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 / React 18.2 / Next.js 14.2 (App Router): Follow standard conventions

## Recent Changes
- 004-fix-social-links: Added TypeScript 5 / Node.js (tsx runner for scripts) + `@sanity/client` (CMS reads/writes), Next.js 14.2 (App Router), Vitest (testing)
- 003-member-publications-news: Added TypeScript 5 / React 18.2 / Next.js 14.2 (App Router) + `@sanity/client`, `@sanity/image-url`, Tailwind CSS 3.4
- 002-people-page-content: Added TypeScript 5 / React 18.2 / Next.js 14.2 (App Router) + `@sanity/client`, `@sanity/image-url`, Tailwind CSS 3.4


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- speckit-harness:start (managed by speckit-harness 1.0.5; edits inside this block are overwritten) -->
## Spec-driven development (Spec Kit harness)

This repository uses GitHub Spec Kit with the speckit-harness workflow. These instructions apply to
every coding agent, whatever tool or model runs it.

**Before any spec, planning, or feature work**, run this from the repository root, replacing
`<agent>` with your Spec Kit integration key (`claude`, `codex`, `gemini`, `cursor-agent`,
`opencode`, and so on; `speckit-harness agents` lists them):

    speckit-harness ensure --agent <agent>

It checks for harness updates, installs or refreshes the workflow for your agent, and prints any
action you need to take. If the command is not found, install the harness on this machine with:

    git clone https://github.com/kcaylor/speckit-harness.git ~/.local/share/speckit-harness && bash ~/.local/share/speckit-harness/bootstrap.sh

**To build a feature**, use the `speckit-run` skill. If your agent does not load skills, read
`.specify/harness/skills/speckit-run/SKILL.md` and follow it. Its input is an existing
specification (`specs/<NNN-name>/spec.md` or a design document). With no specification, it drafts
one after asking the user up to four questions.

**For the constitution**, use `speckit-derive-constitution`
(`.specify/harness/skills/speckit-derive-constitution/SKILL.md`). Do not edit
`.specify/memory/constitution.md` by hand.

- Spec Kit phase instructions for any agent: `.specify/harness/commands/speckit.<phase>.md`
- Decisions reserved for the user: `.specify/memory/run-policy.md`
- Progress for a feature in flight: `specs/<NNN-name>/run-state.md` (read it before resuming)
<!-- speckit-harness:end -->
