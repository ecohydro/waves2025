# WAVES site content, recruiting, and accessibility review

Reviewed September 16, 2026. Scope: current working-tree page templates, navigation, CMS query projections, accessibility specification and CI configuration; direct browser checks of the published homepage, Opportunities and Projects pages, and mobile navigation. No site content or implementation was changed and no inquiry was submitted.

The site has useful scientific material, connected people/publication profiles, and a substantial recruiting page. Its strongest opportunity is to make those resources work together: help students understand research fit, see what training and participation involve, and take a clear next step; help scientific visitors trace claims to findings, contributors, and reusable outputs.

**Implementation update:** [Five Spec Kit improvements](site-improvements-2026-09-16.md) now address the immediate navigation/contact/news/project issues and publication discovery. This review remains the original findings snapshot; consult the implementation records for current behavior and verification limits.

## Requirements and evidence limits

**Subsequent adoption:** After this review, the owner requested standing project standards. Version 1.0.0 of the [WAVES Site Constitution](../../.specify/memory/constitution.md) and root [AGENTS.md](../../AGENTS.md) were created on September 16, 2026. The absence described below records the state at the start of the review, not the current repository. Findings are a dated snapshot; concurrent or later work may remediate them.

No ratified `.specify/memory/constitution.md` exists in this checkout. The constitution template is unfilled, and `specs/001-uc-accessibility/plan.md` also records that no constitution was found. This review therefore uses `specs/001-uc-accessibility/spec.md` as the explicit project baseline: WCAG 2.1 AA, keyboard operation and visible focus, meaningful alternatives, logical headings, accessible forms and status feedback, reduced motion, zoom support, an accessibility statement, and automated checks in development and CI. Do not describe this review as constitutional or WCAG certification.

The current Opportunities page was verified directly in the browser; a web crawler returned an older, much shorter version. Recommendations below account for the current detailed page, including its two doctoral admission routes, funding guidance, funding history, and connected Formspree inquiry. Fellowship eligibility and deadlines were not independently re-audited.

This was a targeted review, not a full screen-reader, contrast, PDF, or cross-browser audit. Source findings and observed behavior are distinguished below. Current uncommitted edits were left intact.

## Immediate repairs

### 1. Repair mobile navigation before expanding it

**Evidence:** `src/components/layout/Navigation.tsx:274` puts the entire interactive menu inside `aria-hidden="true"`. The focus loop uses the last navigation item, but Search follows it. On the published Projects page at 390 × 844, Shift+Tab from Close menu moved focus to the background logo; Escape then did not close the menu. The browser exposed some focused menu content despite the hidden ancestor; that does not make this markup reliable for assistive technologies.

**Action:** Make the decorative backdrop a sibling of the menu. Use a correctly implemented dialog containing ordinary navigation links, or a disclosure navigation pattern without inappropriate menu roles. If modal, make the background inert, include Search in both directions of the focus loop, and restore focus to the trigger on close. Add `aria-expanded` and `aria-controls` to the trigger. Restore focus only after a real close transition; the existing effect also runs on initial mount. Keep the scroll-hiding header visible while focus is inside it.

**Acceptance:** Every link, including Search, is reachable by keyboard; Shift+Tab and Tab behave consistently; Escape closes from anywhere within the modal and returns focus; no interactive descendant has an `aria-hidden` ancestor. Verify with VoiceOver and keyboard, not just a DOM assertion. Relevant project requirements: FR-004, FR-005 where a dialog is used, FR-013.

### 2. Fix the misleading empty homepage news section

**Evidence:** The live homepage says “No recent news available.” `src/app/page.tsx:19` filters returned items on `status`, but `getAllNews` in `src/lib/cms/client.ts:585` already filters published records and does not project `status`. The News page does not repeat this filter and has research stories.

**Action:** Align the query projection and consumer contract. Either return `status` or remove the redundant consumer filter while retaining the published-only query. Add a regression check using the actual projected data shape. Preserve publication dates and distinguish genuine absence from a failed load.

**Acceptance:** Published news appears on Home and News consistently. A data outage never asserts that the lab has no activity.

### 3. Replace the nonfunctional general contact form

**Evidence:** `src/app/contact/page.tsx:186` renders a form without an action, method, or submit handler, yet promises a response. A browser defaults to submitting form values to the current URL using GET; this is not a delivery mechanism and can put entered details into the URL.

**Action:** Route recruiting visitors to `/opportunities#inquiry`. For other visitors, provide a working email link or implement a real contact endpoint with validation, delivery confirmation, and error recovery. Remove the form until it can deliver. Place an email alternative next to the recruiting form as well, rather than relying on the footer. Verify Formspree's spam-check and confirmation experience separately; a configured endpoint alone does not prove successful, accessible delivery.

**Acceptance:** Every visible “Send” action has verified delivery and accessible feedback. Failure preserves entered information and provides another contact route. Project requirements: FR-007 and FR-014.

### 4. Stop advertising an empty project inventory

**Evidence:** The published `/projects` page shows zero total, active, and featured projects. The template also catches fetching errors and continues with an empty array.

**Action:** Publish three reviewed project case studies before promoting the inventory. Until then, direct prominent project links to the populated research overview and remove the zero-count strip. Distinguish unavailable data from a genuinely empty collection. Do not infer that zero CMS records means zero research projects.

**Acceptance:** A visitor following Research Projects reaches substantive research or a clear temporary fallback, never a misleading scientific activity count.

## Recruiting and information architecture

### 5. Make Research and Join the Lab primary destinations

**Evidence:** The desktop/mobile navigation contains Home, People, Publications, News, About, Contact. Research and Opportunities are absent. The homepage hero points to Latest News, and recruitment calls to action on Home, About, and People send visitors to generic Contact or People pages.

**Action:** Use primary navigation: **Research · People · Publications · Join the Lab · About**, plus Search. Keep Home available through the logo; expose News through Home and Research and retain Contact in a utility/footer position. Keep `/opportunities` as the stable URL but label it “Join the Lab.” Link Projects within Research once populated. Existing URLs should remain valid.

Homepage order: plain-language research purpose → Explore Research / Join the Lab → three findings with evidence → student experience → latest news → selected publications. Retain institutional affiliation without letting it displace the two primary actions.

Suggested introductory copy, for lab review: “We study how water moves through plants and landscapes—and how those processes shape ecosystems and livelihoods. At UC Santa Barbara, we combine field measurements, environmental sensing, and modeling to understand environmental change.”

**Acceptance:** From every main page, Research and Join the Lab are one navigation action away on desktop and mobile. Navigation labels, link destinations, and accessible names agree.

### 6. Put research fit and application steps before the fellowship catalogue

The current Opportunities page already explains Bren versus Geography, separates an inquiry from admission, does not require a fellowship or CV for first contact, and distinguishes funding history from current opportunities. Preserve those strengths.

**Action:** Put a dated, lab-approved recruiting status near the top: entry cycle, which roles are being considered, and whether funding is confirmed, contingent, or not yet determined. Add three sections before the long funding list:

1. **Could WAVES be a fit?** Research questions and examples of relevant experience; distinguish useful preparation from skills taught in the lab.
2. **How to get started.** Review a theme and a paper; send a brief inquiry; discuss fit and funding; apply separately through the appropriate program. Link official program deadlines rather than maintaining duplicate unsourced dates.
3. **What to expect here.** Confirmed mentoring practices, group meetings, collaboration, writing support, field/computational options, and expectations on both sides.

Add anchors for admissions, research fit, lab experience, funding, FAQ, and inquiry. Add an FAQ addressing program choice, uncertain research interests, prior research experience, international applicants, and what happens after an inquiry. Only promise a response window the lab can maintain.

Address undergraduate participation explicitly: if offered, state the contact route, paid/credit arrangements, expected time, and prerequisites; otherwise state current availability without inviting applicants into a form that has no matching role. Do not invent openings or funding guarantees.

**Acceptance:** A new visitor can identify eligibility/fit, availability, program route, funding uncertainty, and the next action without reading every fellowship card.

### 7. Give About and People distinct recruiting jobs

**Evidence:** About repeats broad research descriptions already present on Home and Research. People already separates current members and alumni, and profiles link publications and news; these connections are valuable foundations.

**Action:** Make About explain the actual student experience: mentorship, collaboration, training, fieldwork arrangements, accessible participation, and how students develop independence. Use approved specifics rather than generic excellence claims. Add a modest student resources section with maintained onboarding, computing, field preparation, writing, and campus-support links; keep private material in its appropriate internal location.

For current members, add a short research question, methods, and linked project. Add three consented alumni examples connecting their WAVES work, skills developed, and verified subsequent roles, each dated. Existing directory entries should remain available. Do not use selective examples as a placement-rate claim or publish personal contact details without permission.

**Acceptance:** A prospective student can see what they might do, learn, and become, with links to the people and work supporting those examples.

## Demonstrating research quality

### 8. Turn research themes into evidence-led case studies

**Evidence:** Research pages describe methods and broad topics at length. Theme publication previews show titles and abstracts but do not link individual cards to their publication records. Project detail pages provide overview, research areas, team, and resource links, but lack a consistent finding/evidence section and render participant names as plain text.

**Action:** Start each theme with a research question and two or three supported findings. Publish one initial case study per theme with: question; why it matters; study location and scope; method; main finding; limitations; student and collaborator contributions; paper/DOI; data/code where available; next question; and related recruiting route. Link participants to their profiles and projects to publications in both directions.

The News archive already offers candidate material: plant water-use strategies, agricultural water savings, and groundwater-dependent ecosystems. Have the relevant authors verify the claims and select the underlying papers before promotion. For sensing, explain what a named instrument or method enabled and link its validation and reusable resources.

Use one meaningful figure with a descriptive caption, concise alt text, and adjacent explanation of the result. Complex charts also need a longer description or suitable data table; a picture of the figure is not a complete accessible explanation.

**Acceptance:** Every highlighted scientific claim has a traceable output; every theme identifies contributors and a concrete result; publication titles open their records; a text-only reader can understand the finding.

### 9. Curate research highlights instead of using citation count as the gate

**Evidence:** `src/app/publications/page.tsx:87` features the newest four records with more than 30 citations, although the CMS already supports `isFeatured`. This excludes promising recent work until citations accrue.

**Action:** Use editorial selection with a short “why this matters” summary and a balanced set of themes, student-led work, recent findings, and foundational contributions. Keep the complete chronological bibliography. Preserve clear distinctions between articles, preprints, and conference abstracts. Treat citations as contextual metadata with source/update date, not as the sole measure of quality. Avoid implying that journal metrics measure an individual paper's scientific contribution.

Improve discovery by preserving author, area, and publication-type filters together; the current area/type links discard the author parameter. Add visible active-filter labels and a clear reset route. Add accessible title/keyword/year search if the catalogue warrants it. Use concise card summaries: the homepage currently puts an entire abstract into the link's accessible name even where CSS visually truncates it.

**Acceptance:** Highlights have an editorial rationale and evidence links; recent research can be selected without a citation threshold; filters combine predictably; link names remain concise and informative.

### 10. Remove promises and labels that do not lead anywhere

**Evidence:** News says “Browse by Category,” but category cards are not links. Its closing copy promises inbox delivery while linking only to Contact and People. Theme terminology varies between “Coupled Natural-Human Systems,” “Water, Sustainability, and Climate,” and related variants.

**Action:** Implement category links/filters or relabel the section as an overview. Remove subscription language unless there is a working subscription mechanism. Standardize the three theme names sitewide, with plain-language subtitles; keep existing slugs. Use descriptive links such as “All lab news” rather than repeated “View All.”

**Acceptance:** Every navigational invitation has a matching action; the same subject uses a consistent label across pages, forms, and filters.

## Accessibility acceptance criteria for all changes

- Replace the nested `<Link><button>` controls in `src/app/publications/page.tsx:232–282` with single styled links for URL navigation. Expose selected state programmatically and visually without relying only on color. Each control should have one focus stop.
- Preserve the skip link, a single main landmark per public page, and meaningful page titles. Verify skip-link focus movement, not merely scrolling. The current skip target is a wrapper div; use a deliberate focusable destination or focus the main content as needed.
- Follow the project's logical heading requirement. Make year headings parents of publication titles rather than giving both the same level; use a consistent hierarchy for alumni categories and member cards. Audit sidebar/footer headings in context.
- Measure computed contrast in light and dark themes, including hover, selected, error, disabled, and focus states. Normal text: at least 4.5:1; large text: 3:1; essential control boundaries/focus indicators: 3:1. Global `!important` dark-mode overrides make class-name inspection insufficient.
- Test the required 200% zoom and WCAG reflow at a 320 CSS-pixel viewport. Let hero text wrap and expand; avoid fixed-height clipping. Check long titles, navigation, forms, and diagrams. Respect the existing reduced-motion preference support when adding interactions.
- Keep labels, instructions, errors, and success states available to assistive technology. Give the inquiry's month input an understandable alternative for visitors who do not know an exact start month. Test the complete third-party form journey, including failed delivery and spam checks, with keyboard and assistive technology.
- Require meaningful CMS image alternatives; mark decorative imagery appropriately. Replace generic alternatives such as “WAVES Banner” with an actual description when informative, or empty alt text when decorative. Caption and provide appropriate alternatives for any added audio/video.
- Publish essential admissions/research explanations in HTML. The existing specification defers legacy PDF remediation and discloses that limitation; that is not a blanket exemption for inaccessible new content. Offer accessible document alternatives and a visible request route.
- Extend CI beyond the existing isolated UI-component axe tests to full rendered routes and states: mobile menu open, research details, filters, inquiry validation/review, and empty/error states. Include light/dark contrast checks in a real browser and manual keyboard/VoiceOver review. Verify repository branch protection actually requires the relevant checks before describing CI as a merge gate.

Reference: [W3C WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1). Automated checks are useful but cannot establish full conformance by themselves.

## Suggested delivery order and ownership

| Sequence | Deliverable | Owner | Completion evidence |
| --- | --- | --- | --- |
| First | Mobile navigation, general contact, homepage news, empty-project presentation, nested controls | Developer | Keyboard checks, focused regression tests, accurate live content and delivery behavior |
| Next | Primary navigation and recruiting page order; dated availability and FAQ | Developer + PI | A first-time visitor can find research fit, recruiting status, admissions route, and contact without assistance |
| Then | Three research case studies and editorial publication highlights | Theme authors + editor | Claims verified against papers; contributors and resources linked; figures accessible |
| Then | Mentoring/lab experience and alumni examples | PI + consenting members | Current, specific, approved descriptions with review dates |
| Ongoing | Accessibility checks and content maintenance | Named site owner | Full-route checks, documented manual review, refreshed admissions/funding links and member roles |

Suggested usability test: ask five prospective-student readers to find an appropriate research theme, explain one lab finding, determine the admission route, and locate the inquiry. Aim for at least four to complete all four tasks without help; include keyboard and assistive-technology use in testing. Review recruitment information before each admissions cycle and assign each case study a content owner and review date. Measure successful delivery and useful inquiries rather than raw form starts, without collecting the contents of inquiries in analytics.
