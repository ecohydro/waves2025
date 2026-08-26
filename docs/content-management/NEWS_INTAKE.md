# Slack news intake — playbook and ledger

**Built:** 11 August 2026 · **Repo:** `waves2025` · **Status:** code in the
working tree, verified offline. Not yet run against Sanity, and the
`#waves-news` channel does not exist yet.

Lab members post an update in Slack. It becomes a drafted `news` document in
Sanity for Kelly to review and publish. This is the news half of the same
propose-approve-apply loop the publications autopilot uses, with the approval
moved to where the review actually happens.

## Where the gate sits

Kelly approves from Slack, in words. He does not open the Studio, and the
workflow is not allowed to treat the Studio as the primary path.

A member posts. The intake drafts the item into Sanity, where a draft is
invisible to the site. The digest in `#waves2025` carries the drafted item in
full, readable on a phone, with a preview link that renders it as the page it
will become. Kelly replies "publish 1 and 3", or "publish 1 but call it X", or
"skip 2". The next run reads that reply, performs it, and posts the live URLs
back, including into the member's own Slack thread.

An earlier version of this document put the gate in the Studio. Kelly's
correction, 12 August 2026: he is not going to load the CMS to approve every
news item, and a workflow that assumes he will is a workflow that stops running.

The safety property is unchanged. The site queries
`_type == "news" && status == "published"`, and everything the intake writes
carries `status: 'draft'` and a `drafts.` id prefix. Publishing moves the
document out of the draft namespace and sets the status field in one
transaction, and it happens only in response to Kelly's words in the channel.
Silence publishes nothing.

## The pieces

| Piece | Where | What it does |
|---|---|---|
| `scripts/news-intake-core.mjs` | repo | Pure logic: author matching, slugs, validation, document assembly. No I/O. |
| `scripts/news-intake.mjs` | repo | Runner. Talks to the Sanity HTTP API, uploads photos, writes drafts, applies corrections. `npm run news:intake` |
| `scripts/news-review.mjs` | repo | The approval half. `--list` produces the queue the digest is built from; a decisions file publishes, edits, or discards. `npm run news:review` |
| `tests/unit/news-intake.test.mjs` | repo | 43 unit tests over the pure logic of both halves. |
| `tests/fixtures/news-intake/` | repo | A stubbed Sanity API and four sample items for offline runs. |
| `intake` field on the news schema | `src/lib/cms/schemas/news.ts` | Provenance and the dedupe key. Read-only in the Studio. |
| Scheduled task prompt | `docs/content-management/NEWS_INTAKE_TASK_PROMPT.md` | The operating manual the twice-daily Cowork task runs. |
| Member guide | `docs/content-management/NEWS_FOR_LAB_MEMBERS.md` | The one-pager for the group. |
| `src/lib/seo/metadata.ts` | repo | Shared `buildMetadata` helper. Every page that sets metadata goes through it. Added 11 Aug 2026; before that no page on the site had any. |
| `generateMetadata` | the four detail routes | Per-item title, description, canonical, Open Graph, and Twitter card for news, people, publications, and projects. |
| `export const metadata` | 17 static and list pages, plus `src/app/search/layout.tsx` | Titles and descriptions taken from each page's own hero copy. |
| `metadataBase` and title template | `src/app/layout.tsx` | Resolves relative URLs and appends " \| WAVES Lab" to any page that sets its own title. |

Both scripts are dependency-free Node, built-ins only, like
`scripts/website-pubs-digest.mjs`. The Cowork workspace has no working
`tsx`: `node_modules/@esbuild` holds darwin binaries only and the workspace is
Linux, so anything the automation runs has to avoid the TypeScript toolchain.
That is the reason these live in `scripts/` rather than `src/scripts/`.

## Design decisions

**Deduplication keys on the Slack message timestamp.** `intake.slackTs` is
written onto every document and the document id is derived from it
(`news-slack-1786377522-028519`). A rerun over the same channel history creates
nothing. The check reads drafts as well as published documents, so an item
waiting in Kelly's queue is not drafted a second time.

**Authors are matched, never guessed.** Email first, then exact name, then last
name plus first initial. An ambiguous match rejects the item and names the
candidates. A wrong byline on a member's news is worse than an item that waits.
Several members' Slack emails differ from the email on their person page, which
is why the name fallback exists.

**Recoverable problems are repaired, not rejected.** An over-long excerpt gets
trimmed, an unknown category becomes `general`, a malformed link is dropped.
Each repair is reported as a warning. Dropping a member's update over a long
excerpt would teach the group that the channel does not work, which is the
failure this whole thing exists to prevent. Only a missing title, excerpt, body,
or author is fatal.

**A photo without alt text is held back, and the item is still drafted.** The
schema requires alt text on `featuredImage`. Rather than fail the item or invent
a description, the intake drafts the text and tells Kelly the photo is waiting.

**The preview link is the site's own preview route, not a mock.**
`/api/preview?secret=…&type=news&slug=…` sets draft mode and renders the real
page with the real design. Two things had to be fixed for that to work: the
route checked whether the document existed using the published client, which
404s exactly the drafts preview exists to show, and `SANITY_PREVIEW_SECRET` was
not set anywhere. The route now checks through the preview client, and a secret
is in `.env.local`. **The same value has to be added to the Vercel project
before preview links work on the deployed site.**

**Publishing is two changes that have to happen together.** The document moves
out of the `drafts.` namespace, which is what Sanity treats as published, and
the `status` field is set to `published`, which is what the site's queries
filter on. Doing one without the other produces an item that looks live in the
Studio and is invisible on the page, or the reverse. `buildPublishMutations`
emits both as one transaction, so a failure leaves the draft where it was.

**An item is checked before it goes live.** `readyToPublish` refuses anything
missing a title, slug, excerpt, body, date, author, category, or alt text on its
photo, and names what is missing. Kelly saying "publish all" cannot put a broken
page on the site.

**Kelly can edit from chat, within limits.** "Publish 1 but call it X" applies a
whitelisted `set`: title, excerpt, content, category, tags, date, featured flag.
The slug follows a new title only when it is still the one derived from the old
title. Author and photo are not editable from chat, since both need something
richer than a sentence.

**Corrections apply to drafts, never to published items.** A member who replies
in their own thread gets the draft updated on the next run. Three guards: the
document must still be a draft, since a published page may already have been
shared; the correction must be newer than the last one applied, so a rerun
changes nothing; and only fields that actually differ are written, so an edit
Kelly already made in the Studio survives unless the member changed that same
field. A correction against a published item is reported as
`needs-manual-edit` with the Studio link. Photo swaps are never applied
automatically.

**Link previews are derived at render, not stored.** `buildMetadata` composes
the title, description, canonical URL, Open Graph block, and Twitter card from
the document itself: the excerpt or abstract or bio, stripped of markdown and
trimmed to 160 characters on a word boundary, plus the item's own image at
1200x630 (1200x1200 for a person's portrait). Anything typed by hand into a
document's `seo` object in the Studio wins, and `socialMedia.twitterText`
overrides the Twitter description on news items.

A page with no image of its own falls back to the site logo with a `summary`
card rather than `summary_large_image`, since the logo is close to square and a
wide card would crop it badly. Publications have no image field at all, so their
previews use the logo and a citation line when the record carries no abstract.

The intake deliberately writes nothing into `seo`. A stored copy of the title
and excerpt would be one more thing to keep in step every time a correction
arrives, and it would go stale the first time Kelly edits the headline in the
Studio.

**The member supplies almost nothing.** Of the fields the schema requires, only
the author comes from the member, and it comes from their Slack profile rather
than anything they type. Title, excerpt, body, slug, category, and alt text are
all written by the intake; the date defaults to the message time. The two things
a member can actually block are having no person page, and an event in the past
with no date given. That is the reason the front door can stay as loose as a
sentence in a channel.

**Silence on a quiet day.** No new messages means no digest. The publications
check posts a "nothing this week" line; the news intake does not, because it
runs twice a day and that would be ten empty messages a week.

## Setup, still to do

1. ~~Create `#waves-news`~~ Done, 11 Aug 2026. Channel ID `C0BPLE8MJSW`.
   Still to do: invite the group, and pin the member guide or paste it as the
   channel canvas.
2. ~~Put the channel ID into the task prompt~~ Done. The prompt carries both
   channel IDs.
2b. **Build the "Post lab news" form** in Slack Workflow Builder. Built
   12 Aug 2026, triggered by a message in `#waves-news` containing "news" or
   "item". That trigger is friendlier than a button, since nobody has to find
   it, at the cost of one update arriving as two messages. The task pairs them:
   a threaded form reply belongs to its parent, and a top-level form post
   suppresses the same member's triggering message from the previous 30 minutes.
   Questions, in order:

   1. What happened? (long answer, required)
   2. When did it happen? (short answer, optional, hint "leave blank for today")
   3. Who else was involved? (short answer, optional)
   4. Link, if there is one (short answer, optional)
   5. Category (select one: Award or fellowship · Paper or preprint · Talk,
      poster, or conference · Fieldwork or deployment · Lab milestone ·
      Outreach or press · New grant · Something else)
   6. Photo (file upload, optional, if your plan offers the question type)

   The message it posts must follow this template exactly, since the task parses
   the labels:

   ```
   📰 *News from {person who submitted this form}*
   *Submitted by:* {person who submitted this form}
   *What happened:* {question 1}
   *When:* {question 2}
   *Who else:* {question 3}
   *Link:* {question 4}
   *Category:* {question 5}
   ```

   Workflow Builder requires a paid Slack plan. If the workspace is on the free
   plan, skip this step: free text and the 📰 reaction carry everything, and the
   only cost is an extra question in thread now and then.
3. **Announce it in `#ucsb-lab`**, where the group already is. That channel has
   22 members and is where lab news currently goes to die. Mention the 📰
   reaction, since it works without anyone joining a new channel.
4. **Create the scheduled task** in the desktop app, "On your computer", with
   the prompt from `NEWS_INTAKE_TASK_PROMPT.md`. Suggested `0 15,19,23 * * 1-5`
   UTC, which is 8am, noon, and 4pm Pacific on weekdays. Three runs a day keeps
   the gap between "publish it" and the item going live to a few hours, and a
   run with nothing to say posts nothing.
4b. ~~Add `SANITY_PREVIEW_SECRET` to the Vercel project~~ Done. Vercel already
   had one, and `.env.local` now carries the same value. Verified 11 Aug 2026
   against a published item: the preview route accepted the secret and rendered
   the page. Drafts will preview once the route fix is deployed.
5. **First live run by hand**, with a real message in the channel, dry run
   first: `npm run news:intake -- --file /tmp/items.json --json`.

## Open items

- **`SLACK_FILE_TOKEN` is not set**, so photos attached in Slack cannot be
  fetched. The item still drafts; the photo is reported as failed and Kelly adds
  it in the Studio by dragging it in. To close this, add a Slack token with
  `files:read` to `.env.local`. The script already checks the response content
  type, because an unauthorized Slack file URL answers 200 with an HTML sign-in
  page that would otherwise upload cleanly as a broken image.
- **Eddy, the bot in `#ucsb-lab`, offers to add news posts as pull requests.**
  That route predates the Sanity migration and would now produce MDX nobody
  renders. Worth pointing Eddy's news path at this workflow, or telling it to
  hand news off.
- **`_to_delete/` in the repo root** holds a first pass of these scripts written
  in TypeScript before the esbuild limitation surfaced, a stray probe file, and
  the one-shot script that added metadata across the site. The Cowork workspace
  cannot delete files. Remove the folder next time you are in a terminal.
- **`npm run build` has not been run** against any of this. The workspace has no
  network and the build fetches from Sanity, so the metadata work is verified by
  type-check and lint only. Worth one local build before pushing.
- The `.fuse_hidden0000001800000001` artifact noted in the publications write-up
  is still in `src/scripts/semantic-scholar/`.

## Ledger

One row per Slack message handled. The scheduled task appends to this on every
run, before it posts its digest.

| Slack ts | Date | Member | Title | Outcome |
|---|---|---|---|---|
| _(none yet)_ | | | | |
