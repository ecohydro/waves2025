# Working on the WAVES Lab website

This file applies to the entire repository. Before changing content, design, or code, read the [WAVES Site Constitution](.specify/memory/constitution.md). It is the canonical source for brand, voice, scientific integrity, recruiting, accessibility, and engineering standards. Do not treat the current implementation as proof that it meets those standards.

## Current state and open work

Read [docs/OPEN_WORK.md](docs/OPEN_WORK.md) at the start of a session. It records what is unfinished, decisions already made that should not be reopened, and how the site ships (`main` deploys to production through the Vercel GitHub integration). Update it when any of those change.

## Working agreement

- Follow the user's current task and preserve unrelated work. Inspect `git status` before editing; concurrent edits may be present. Never revert, overwrite, or commit someone else's changes as part of your task.
- Apply the constitution to new and changed work. Fix related defects within scope; record unrelated debt rather than turning a small task into a site rewrite.
- Proceed with routine, reversible work already authorized by the task. These files introduce no additional approval ceremony. Seek factual clarification only when missing information affects a consequential claim or action and cannot be verified.
- Explicit user instructions and applicable higher-priority instructions take precedence. Record intentional departures from the constitution in the task/PR; do not silently redefine policy.
- Do not publish fabricated openings, deadlines, funding, awards, metrics, student experiences, alumni outcomes, or endorsements. Draft uncertain claims for review and keep them out of public production content.
- Do not run CMS mutation, import, migration, bulk update, email, or deployment scripts merely to inspect the site. Confirm scope from the user's authorization; prefer read-only inspection and supported dry runs when preparing changes.

## Product and editorial defaults

- Serve two primary journeys: **understand the research** and **determine whether/how to join the lab**. Use concrete evidence and clear next steps.
- Use **WAVES Lab** as the short name and **Water, Vegetation, and Society (WAVES) Lab** on first explanatory mention. Use **UC Santa Barbara** in public copy; UCSB is acceptable after expansion or in compact contexts.
- Use the three theme labels **Ecohydrology**, **Environmental Sensing**, and **Coupled Natural-Human Systems** consistently. Explain technical labels in plain language. Retain stable route slugs.
- Write warm, precise, evidence-based prose. Prefer a research question, finding, or student action over generic claims of excellence. Credit students and collaborators accurately.
- Use **Join the Lab** as the recruiting navigation/action label, pointing to the existing `/opportunities` route. An inquiry is not an admissions application. Fellowships under consideration are not confirmed funding.
- Reuse real lab imagery, established design tokens, shared components, and the existing logo. Check both light and dark appearances. Accessible presentation takes priority over an exact decorative color or layout.

## Repository map and implementation defaults

- `src/app/`: Next.js App Router pages, layouts, and routes.
- `src/components/`: shared layout, UI, and feature components.
- `src/lib/cms/`: Sanity queries, types, schemas, and integration utilities.
- `content/`, `legacy/`: migrated content and historical source material; do not assume they are the current published source of truth.
- `public/`: static assets, including `/images/site/WAVES_logo.png`.
- `specs/`: feature requirements and plans. The accessibility detail is in `specs/001-uc-accessibility/spec.md`; the constitution preserves its baseline.
- `docs/content/site-review-2026-09-16.md`: dated review and proposed improvements, not a statement of current implementation or an automatic authorization to implement everything.
- `package.json` and the lockfile define installed tooling. The current app uses Next.js, React, TypeScript, Tailwind, Sanity, and Vitest. Do not introduce an alternative framework, styling system, or CMS for a local change.
- Prefer server components for content pages and client components only for interaction. Preserve preview/published separation, metadata, canonical URLs, existing redirects, and content relationships.
- Keep GROQ projections and their consumers aligned. A TypeScript interface does not cause an omitted field to appear in a query response. Test representative projected data, missing fields, empty results, and failures where relevant.
- Use semantic links for navigation and buttons for actions. Never nest interactive controls. Never put focusable content inside an `aria-hidden` ancestor.
- Do not add dependencies without a concrete need. Never expose server secrets in client bundles, public environment variables, logs, URLs, or generated reports.

## Spec Kit workflow

Use the checked-in `.claude/commands/speckit.*.md` workflow and `.specify/` templates/scripts for each new feature or improvement: specify requirements, evaluate the constitution in a plan, create dependency-ordered tasks, implement, and record actual validation. Keep independent improvements in distinct numbered `specs/` directories. Continue through implementation when the user authorized it; do not stop after planning merely because an individual command's handoff describes a pause.

Preserve existing work when selecting branches. Use `codex/` for new branch names and the supported `SPECIFY_FEATURE=NNN-feature-name` override for scripts that expect a numeric feature ID. When several improvements share an already-dirty checkout, document a shared working branch rather than pretending they are isolated. Keep tasks current and distinguish implementation completion from unperformed deployment, delivery, or accessibility certification.

## Validation proportional to the change

Check scripts in `package.json` before running them; older documentation includes commands that do not exist.

For application-code changes, run the relevant tests and these existing checks:

```sh
npm run lint
npm run type-check
npm run test:fast
npm run build
```

Use focused regression tests for meaningful behavior changes; prefer a failing test before fixing a reproducible bug. Do not add tests that merely restate the implementation. Pure prose/documentation changes need fact, link, and consistency checks, not a full application build. Cosmetic changes need relevant browser/contrast/reflow checks, not invented business-logic tests.

For UI changes, exercise affected routes and states in a browser. Check keyboard use, visible focus, headings, labels, light/dark contrast, mobile reflow, 200% zoom, and reduced motion as relevant. For navigation/dialog/form changes, include assistive-technology checks and errors/success states. Automated axe tests supplement manual checks; never claim WCAG conformance based on automated results alone.

CMS integration tests may need credentials or a running service. Use `npm run test:sanity-data` or `npm run test:full-integration` only when relevant and their prerequisites are available; inspect tests before running against shared data. Do not mutate production to make a test pass. For route changes, use the existing `npm run validate:redirects` as relevant.

Report what changed, why, the checks actually performed, and remaining limitations. Separate existing failures from regressions. Do not call an untested workflow verified, a mocked delivery successful, or a proposed CI gate enforced. Do not disable required checks to obtain a passing result.

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
