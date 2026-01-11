### Semantic Scholar Integration: Utilities, Workflows, and Tests

Our goal is to enrich publication MDX frontmatter with authoritative metadata from the Semantic Scholar (SS) API. We prioritize stable identifiers (`paperId`) for upserts, persist SS-specific metadata under a single `semanticScholar` block, and keep runs resumable and rate-limit friendly.

This guide explains how to audit existing publication MDX files for missing metadata, enhance them using Semantic Scholar, and add or update publications by DOI or title.

#### Prerequisites

- Node 18+
- `tsx` installed (project dev dependency)
- Optional: set `SEMANTIC_SCHOLAR_API_KEY` in `.env.local` to enable authenticated requests and higher rate limits

#### Environment

- `SEMANTIC_SCHOLAR_API_KEY`: API key sent via `x-api-key` header when present
- `SEMANTIC_SCHOLAR_DISABLE_API_KEY`: set to `true` to disable the key (use the shared unauthenticated pool)
- `SEMANTIC_SCHOLAR_USER_AGENT`: optional custom user agent for API requests

All utilities and scripts automatically pick these up when present.

Rate limiting guidance:

- Unauthenticated: ~100 requests per 5 minutes (shared pool). Use `--delay 6` or higher.
- Authenticated: higher throughput. Still add short delays (e.g., 2–3s) to be polite and reduce spikes.

#### Utilities and CLI

- `src/lib/migration/semantic-scholar-utils.ts`
  - `fetchAuthorInfoById(authorId, fields?)` — uses `author/batch` to fetch author info including `papers` with `paperId`s
  - `fetchPaperById(paperId, fields?)` — fetch a single paper by its Semantic Scholar `paperId`
  - Both respect authentication and retry once without the key on 403

  Example:

  ```ts
  import { fetchAuthorInfoById, fetchPaperById } from '@/lib/migration/semantic-scholar-utils';

  const author = await fetchAuthorInfoById('2277507', 'name,url,paperCount,hIndex,papers');
  if (author?.papers?.length) {
    const paper = await fetchPaperById(author.papers[0].paperId);
    // use fields
  }
  ```

- `src/lib/migration/author-info-cli.ts`
  - Fetch an author (and optionally papers)
  - Usage:
    ```bash
    npx tsx src/lib/migration/author-info-cli.ts --authorId 2277507 --papers --limit 50
    # disable key for a run
    npx tsx src/lib/migration/author-info-cli.ts --authorId 2277507 --no-auth
    ```

#### 1) Audit publications for missing data

Run an audit over `content/publications` to identify entries missing a `semanticScholar` block, `abstract`, or `keywords`.

```bash
npx tsx src/lib/migration/audit-publications-semantic.ts \
  --sourceDir content/publications \
  --report publication-semantic-audit.json
```

To also flag files in-place by adding `needsSemanticScholarUpdate: true` and a list of `semanticScholarIssues` to their frontmatter:

```bash
npx tsx src/lib/migration/audit-publications-semantic.ts --sourceDir content/publications --write
```

Outputs a JSON report with counts and a list of affected files.

Note on reports:

- The canonical Semantic Scholar audit report filename is `publication-semantic-audit.json`.
- Generic audits (`src/scripts/audit-publications.ts`) and fix scripts (`src/scripts/fix-publications.ts`) no longer write reports by default; pass `--report <path>` when you need those outputs.

Common audit usage:

```bash
# Dry audit with JSON output
npx tsx src/lib/migration/audit-publications-semantic.ts --sourceDir content/publications --report publication-semantic-audit.json

# Flag MDX files in-place with needsSemanticScholarUpdate and reasons
npx tsx src/lib/migration/audit-publications-semantic.ts --sourceDir content/publications --write
```

#### 2) Run the background enhancement processor

Enhance publications with Semantic Scholar data over time. Progress is saved and can be resumed.

```bash
./scripts/start-semantic-scholar-background.sh \
  [--no-skip-existing] \
  [--delay 6] \
  [--batch-size 10] \
  [--dry-run] \
  [--no-auth]
```

Notes:

- Default delay is 6 seconds between requests. Increase if you see rate limiting.
- Use `--no-skip-existing` to re-process files that already contain a `semanticScholar` block.
- `--dry-run` simulates updates without writing files.
- `--no-auth` disables the API key for this run.

Behavior & lifecycle:

- Progress persists in `semantic-scholar-progress.json` so you can stop/resume safely.
- Press Ctrl+C to stop gracefully. The process cancels pending delays, saves progress, and exits.
- Uses a conservative delay between requests and prints periodic progress.
- Skips files that already have a `semanticScholar` block unless `--no-skip-existing` is supplied.

#### 3) Upsert publications by DOI or Title

Add new publications or enhance existing ones by providing DOIs and/or titles.

```bash
# By DOIs (comma-separated or JSON array)
npx tsx src/lib/migration/upsert-publications-from-ss.ts --dois "10.1371/journal.pone.0033996,10.1016/j.apgeog.2017.08.018" --sourceDir content/publications --outDir content/publications

# By Titles
npx tsx src/lib/migration/upsert-publications-from-ss.ts --titles "Evaluating ecohydrological theories of woody root distribution in the Kalahari" --sourceDir content/publications

# Dry run mode (preview changes without writing):
npx tsx src/lib/migration/upsert-publications-from-ss.ts --dois "10.1234/abc" --dry-run
```

Behavior:

- If a DOI matches an existing MDX, that file is updated with Semantic Scholar data (abstract, keywords/fields, and `semanticScholar` block).
- If no match is found, a new MDX is created in `--outDir` with frontmatter populated from Semantic Scholar.
- If only a title is provided and no DOI is returned, a best-effort title match is attempted; otherwise a new MDX is created.

Update semantics:

- Existing files: we merge into any existing `semanticScholar` object, add fresh fields from SS, and set `semanticScholar.status: 'updated'`.
- New files: we populate `semanticScholar` from the API and set `semanticScholar.status: 'new'`.
- Keywords: filled from `fieldsOfStudy` (or `s2FieldsOfStudy.category` fallback) when missing.

#### Frontmatter additions

The mapper stores additional fields from the API, including:

- `semanticScholar.doi`
- `semanticScholar.externalIds`
- `semanticScholar.s2FieldsOfStudy`
- `semanticScholar.publicationTypes`
- `semanticScholar.publicationDate`
- `semanticScholar.venue` (name and id)
- `semanticScholar.enhancedAuthors` (basic per-author metadata)

Additional behavior:

- `semanticScholar.paperId` is always recorded if available
- `semanticScholar.status` is set to `'new'` for created publications and `'updated'` for existing ones when enhanced
- `semanticScholar.lastUpdated` records the timestamp when enrichment occurred

These are nested under `semanticScholar` to avoid collisions with existing frontmatter fields.

#### Troubleshooting

- 429 rate limiting: increase delay or set `SEMANTIC_SCHOLAR_API_KEY` in `.env.local`.
- Missing abstracts: not all papers have abstracts in the API.
- Slug collisions when creating new files: adjust title or add year for uniqueness.
- 403 with API key: verify or regenerate your key. You can also run with `SEMANTIC_SCHOLAR_DISABLE_API_KEY=true` or CLI `--no-auth`.
- YAMLException: gray-matter cannot dump `undefined`. Scripts now prune undefineds, but if you hit this in custom scripts, ensure you strip `undefined` values before writing.
- Duplicates: prefer syncing by `semanticScholar.paperId` to avoid DOI/title ambiguity.
- Hangs on Ctrl+C: the background script cancels pending delays and exits; update to latest if you see hanging.

#### Recommended Author-based Upsert (Preferred)

1. Use `fetchAuthorInfoById(authorId, 'name,url,paperCount,hIndex,papers')` to get an author's list of `paperId`s.
2. For each `paperId`, call `fetchPaperById(paperId)` and upsert:
   - If a publication exists, update it and set `semanticScholar.status: 'updated'`.
   - Otherwise, create a new publication and set `semanticScholar.status: 'new'`.
3. Persist `semanticScholar.paperId` for future syncs and de-duplication.

This approach avoids ambiguous title searches and inconsistent DOIs.

Example (programmatic upsert by author):

```ts
import { fetchAuthorInfoById, fetchPaperById } from '@/lib/migration/semantic-scholar-utils';
// import { upsertByDOI } from '@/lib/migration/upsert-publications-from-ss'; // current CLI supports DOI/title

async function upsertByAuthor(authorId: string) {
  const author = await fetchAuthorInfoById(authorId, 'name,url,paperCount,hIndex,papers');
  if (!author || !Array.isArray(author.papers)) return;
  for (const { paperId } of author.papers) {
    const paper = await fetchPaperById(paperId);
    if (!paper) continue;
    // Preferred: create a small helper that mirrors upsert-by-DOI logic but keyed by paperId
    // For now, if DOI exists, we can reuse the DOI upsert CLI by invoking its function or shelling out
    // await upsertByDOI(String(paper.externalIds?.DOI), 'content/publications', 'content/publications', false);
  }
}
```

Note: A dedicated paperId-based upsert utility can be added to mirror the existing DOI/title upsert for a turn-key author import.

Best practices:

- Prefer `paperId` for identity and future diffs.
- Use conservative delays or authenticated runs to avoid 429s.
- Run with `--dry-run` first; then re-run without it to commit changes.
- Keep `semanticScholar.status` and `paperId` in frontmatter to speed subsequent updates.

CLI cheat sheet:

```bash
# Audit (semantic scholar specific)
npx tsx src/lib/migration/audit-publications-semantic.ts --sourceDir content/publications --report publication-semantic-audit.json

# Background enhancement (resumable)
./scripts/start-semantic-scholar-background.sh --delay 6

# Upsert by DOI (dry-run)
npx tsx src/lib/migration/upsert-publications-from-ss.ts --dois "10.1234/abc" --dry-run

# Upsert by Title
npx tsx src/lib/migration/upsert-publications-from-ss.ts --titles "Some Title" --sourceDir content/publications

# Fast inserts only (new publications by authorId; skips existing by paperId/DOI)
npx tsx src/scripts/semantic-scholar/add-new-publications-by-author.ts --authorId 2277507 --sourceDir content/publications --outDir content/publications --max 25 --dry-run

# Update existing publications (only those older than 90 days by default)
npx tsx src/scripts/semantic-scholar/update-publications.ts --sourceDir content/publications --olderThanDays 90 --dry-run

# Optional: disable key
SEMANTIC_SCHOLAR_DISABLE_API_KEY=true ./scripts/start-semantic-scholar-background.sh
```

#### Testing

- Unit (mocks fetch):

  ```bash
  npx vitest run src/lib/migration/__tests__/semantic-scholar-utils.test.ts
  ```

- Integration (live API; uses `author_information.json` for `authorId` fixture):
  ```bash
  npx vitest run --config vitest.integration.config.ts tests/integration/semantic-scholar-api.int.test.ts
  ```

The integration test validates response shape (not full payload) to remain stable as the API evolves.

#### Future integration (Slack)

The upsert script can be invoked from a webhook or Slack command. Example concept:
`/add-pub doi:10.10234/journal20.214` → server calls the upsert script with `--dois` and commits the created/updated MDX.
