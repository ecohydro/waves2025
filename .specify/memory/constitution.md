# WAVES Lab Site Constitution

**Version**: 1.0.0 | **Ratified**: 2026-09-16 | **Last amended**: 2026-09-16

## Purpose and scope

The WAVES Lab website must help students understand the lab, assess research fit, and find a usable path to participation. It must demonstrate the substance and quality of the lab's research through findings, methods, people, and accessible evidence. It also serves current members, collaborators, and scientific and public audiences.

This constitution governs site content, information architecture, visual identity, interaction, CMS authoring, and technical delivery. MUST and MUST NOT denote requirements; SHOULD denotes the normal approach, with a documented reason for an alternative. Requirements describe the target standard, not a certification that the existing site satisfies it.

## I. Identity and visual continuity

- The public short name is **WAVES Lab**. First explanatory mention SHOULD use **Water, Vegetation, and Society (WAVES) Lab**. A compact display headline may use “Water, Vegetation, & Society.”
- Identify the lab with **UC Santa Barbara**. Describe Bren School of Environmental Science & Management, Department of Geography, and Earth Research Institute affiliations accurately without implying that a lab statement is an official university-wide position.
- Canonical theme labels are **Ecohydrology**, **Environmental Sensing**, and **Coupled Natural-Human Systems**. Page subtitles may explain these terms, but navigation, filters, cards, and CMS labels MUST use consistent names. Existing slugs `/research/ecohydrology`, `/research/sensors`, and `/research/cnh` MUST remain stable or receive deliberate redirects.
- Reuse the existing WAVES logo and authentic lab/research imagery. Do not distort the logo, invent university marks, or imply institutional endorsement. Obtain and preserve appropriate permission, attribution, and consent for images and personal stories. Synthetic or stock imagery MUST NOT be presented as actual lab members, field sites, instruments, or results.
- The existing blue/cyan palette is the starting point: `wavesBlue` #0077b6, `wavesDarkBlue` #023e8a, `wavesLightBlue` #90e0ef, `wavesAccent` #00b4d8, with neutral surfaces and readable text. These are site tokens, not a declaration of official university brand colors. Light/accent colors are not automatically suitable for text.
- Use the established sans-serif presentation, with Inter as the intended primary family and reliable system fallbacks; reserve monospace for code/data where useful. Existing font declarations are inconsistent: verify actual rendering and consolidate through shared tokens when typography is in scope. Do not add a second display typeface on an individual page.
- Prefer generous whitespace, readable line lengths, clear hierarchy, and real explanatory figures. Maintain shared spacing, typography, color, and component tokens rather than per-page styles or escalating global `!important` overrides. Any palette/type adjustment MUST retain accessibility and be applied consistently to affected shared components.
- Decorative motion, large banners, overlays, and fixed heights MUST NOT obscure content, focus, or primary actions. Research and recruiting content must remain understandable without imagery or animation.

## II. Voice, claims, and attribution

- Write with scientific precision and a welcoming, direct voice. Use “we” for the lab and “you” where it clarifies a student action. Explain specialized terms on first use; retain necessary disciplinary terminology for scientific readers.
- Prefer concrete questions, methods, findings, and implications over “world-class,” “cutting-edge,” “groundbreaking,” or other unsupported superlatives. Distinguish observations from interpretations and future work. State important limitations without overstating certainty or causality.
- Quantitative results, awards, funding histories, collaborations, current positions, and claims of impact MUST be traceable to a paper, official source, or verified lab record. Link evidence near the claim where useful. Preserve scope, dates, units, and uncertainty in summaries.
- Credit student leadership and collaborators accurately. Do not infer authorship roles from author order alone or turn an individual award into a lab-wide award. Alumni examples MUST be verified, dated where time-sensitive, and shared with appropriate consent; selected examples are not placement-rate statistics.
- Distinguish peer-reviewed articles, preprints, conference papers, and abstracts. Metrics MUST have an identifiable source and, where presented as current, an update date. Citation counts and journal metrics MUST NOT be treated as a complete measure of scientific quality.
- Never fabricate admissions policies, available positions, guaranteed support, mentoring practices, project outcomes, testimonials, or accessibility conformance. When facts are uncertain, verify them or use clearly labeled internal draft notes; do not publish plausible filler.

## III. Information architecture and research evidence

- **Research** and **Join the Lab** MUST be easy to locate through consistent primary navigation on desktop and mobile. The recruiting destination is `/opportunities`; the visible label should describe the user's goal. Existing URLs MUST be preserved or redirected intentionally.
- Each public page MUST have a clear purpose and descriptive title. Home introduces the lab and its two primary journeys; Research explains questions and findings; People identifies contributors; Publications provides scholarly records; Join the Lab explains participation; About explains the group and its practices; News provides dated updates; Contact provides working contact routes.
- Research highlights SHOULD connect a question, method, finding, significance/limitations, contributors, and supporting outputs. Theme and project pages SHOULD link to relevant people, papers, and reusable data/code where available. Do not promise open resources that cannot be accessed.
- Editorial highlights SHOULD represent important contributions across themes and career stages, including recent student work. Citation thresholds alone MUST NOT determine what counts as featured quality.
- Link text MUST describe its destination. Filters and controls MUST perform their advertised action, preserve compatible selections, show active state, and offer a clear reset. No fake subscription prompts, dead category cards, or placeholder send actions.
- Empty CMS inventories and request failures MUST be distinguished. A missing record MUST NOT be presented as evidence that the lab has no research, news, or people. Hide misleading counts and provide an honest, useful fallback.

## IV. Recruiting, student usefulness, and stewardship

- Recruiting content MUST distinguish a lab inquiry from formal program admission, and possible fellowship support from confirmed funding. Keep program-specific requirements linked to official sources, with review dates for time-sensitive guidance.
- State current recruiting availability, applicable cycle, role, and funding conditions only when verified. Do not infer openings from an active project or a historical fellowship. Do not make securing a fellowship or providing a CV a prerequisite for first contact unless that is a verified requirement for the specific role.
- Help visitors understand research fit, useful preparation versus skills they can learn, admission routes, application steps, and what happens after an inquiry. Address undergraduate, doctoral, postdoctoral, and visiting participation only to the extent actually offered; make unavailable or uncertain routes clear.
- Describe confirmed mentoring, collaboration, training, and field/computational participation practices. Do not equate accessibility needs with lack of research fit. Provide a contact route for discussing participation and accommodations without requesting diagnoses or unnecessary sensitive information.
- Contact and inquiry routes MUST work, use clear labels, minimize required information, explain its use, and provide accessible confirmation/error recovery and an alternative contact route. Response promises MUST reflect a maintained lab practice. Do not put inquiry contents into URLs, analytics, or public logs.
- Assign a content owner and review date to time-sensitive recruiting, funding, project-status, and member information in CMS fields or maintained editorial records. Review recruiting before each admission cycle and whenever relevant policies change. Historical content may remain as an explicitly dated archive.

## V. Accessibility is a release requirement

The baseline is **WCAG 2.1 Level AA**, preserving the detailed commitments in `specs/001-uc-accessibility/spec.md`. Apply any additional applicable institutional requirements when verified; a project document does not supersede them. The following are requirements for new/changed public experiences:

1. Use semantic HTML, a descriptive page title, a single main landmark, labeled navigation landmarks, and a logical heading hierarchy without skipped levels. Provide a visible-on-focus skip link as the first focusable element and verify that it moves the user's reading/keyboard position past repeated navigation.
2. All interactions MUST work with keyboard and assistive technology. Use links for navigation and buttons for actions; never nest interactive controls or place focusable content inside an `aria-hidden` ancestor. Focus order MUST follow the reading order, remain visible, and avoid unintended traps or hidden destinations.
3. Dialogs MUST have an accessible name, appropriate description, correct dialog semantics, focus entry/containment, Escape handling where appropriate, and restoration on close. Navigation disclosures MUST expose expanded state and relationships. Do not use application-menu roles for ordinary site navigation unless the full required interaction pattern is implemented.
4. Normal text MUST achieve at least 4.5:1 contrast; large text at least 3:1; essential control boundaries, icons, and focus indicators at least 3:1 against adjacent colors. Test computed colors in light/dark modes and interactive states. Never convey meaning through color alone.
5. Informative imagery MUST have meaningful alternatives; decorative imagery MUST have empty alt text. CMS authoring MUST require an appropriate alternative or an explicit decorative designation. Complex figures/maps MUST also have an accessible explanation or equivalent data; captions alone may be insufficient. Added media MUST include the applicable captions, transcripts, and visual-description alternatives.
6. Forms MUST have programmatic labels, required-state instructions, understandable field errors, focus management, and announced status/success changes. Third-party submission, spam-check, error, and confirmation experiences are part of the workflow and MUST be evaluated; provide an accessible alternative when necessary.
7. Content MUST remain usable at 200% zoom and reflow at 320 CSS pixels without two-dimensional scrolling except content that inherently requires it, such as a complex data table. Essential text MUST NOT be clipped by fixed-height containers. Honor text spacing and reduced-motion preferences.
8. Maintain the footer-linked accessibility statement, honest conformance target, known limitations, and a working barrier-report/alternative-format contact. Do not claim full conformance without an adequate evaluation.
9. Publish essential information in accessible HTML. Legacy PDF remediation remains separately scoped as in the existing accessibility specification, with limitations disclosed and alternatives available. This MUST NOT become an exemption for inaccessible new downloads or information available only in a PDF.
10. Maintain development-time accessibility linting and CI accessibility checks that block regressions, supplemented by manual keyboard and assistive-technology checks. Full-route and interactive-state checks are necessary; passing isolated component tests is not proof of page conformance. Verify required-check/branch settings before claiming that merges are blocked.

Reference: [W3C WCAG 2.1](https://www.w3.org/TR/WCAG21/). Existing defects are remediation debt, not precedents permitting new defects. Fix issues introduced or worsened by a change before describing that change as complete; record unrelated pre-existing gaps with their scope and follow-up rather than claiming site-wide compliance.

## VI. Technical integrity and maintainability

- Use the repository's Next.js App Router, React, TypeScript, Tailwind, Sanity, and Vitest architecture. The manifests and lockfile govern actual versions. Favor small, reusable components and server-rendered content; add client JavaScript only where necessary.
- Treat CMS queries and returned data as explicit contracts. Keep schema, projection, types, and rendering consistent. Enforce published/private/preview boundaries; use safe rendering for rich text. Validate untrusted inputs at service boundaries and preserve authorization checks.
- Preserve stable content identifiers, slugs, redirects, canonical metadata, and relationships. Migrations MUST be scoped, repeatable where practical, and prepared with appropriate backup, validation, dry-run, and rollback measures. Inspection does not authorize production mutation.
- Secrets and personal data MUST NOT enter client bundles, public configuration, source control, logs, URL query strings, or analytics. Minimize collection and access. Do not weaken authentication, accessibility checks, or validation to make delivery easier.
- Use optimized responsive images, deliberate caching/revalidation, and bounded data loading. Handle failures explicitly and use honest status messages. Add dependencies only for a demonstrated need that the current stack does not meet reasonably.
- Prefer shared semantic design tokens to blanket CSS overrides. Browser inspection MUST verify actual styles and interactions, especially when changing global styles or shared components.
- Test proportionally: behavioral fixes need meaningful regression checks; data/API changes need contract and failure checks; UI changes need relevant browser/accessibility checks. Documentation-only changes need factual/link consistency checks, not artificial tests. Do not add tests that merely mirror implementation.
- For application changes, run the relevant existing lint, type, fast-test, and build checks; run integration checks when the change affects an integration and prerequisites are available. State exactly which checks ran and disclose blocked checks and pre-existing failures. Do not claim unperformed validation.

## Governance and application

This is the canonical project standard; `AGENTS.md` supplies operational guidance. Read both before work. The constitution supersedes conflicting legacy repository guidance, templates, and generated notes, including blanket requirements for irrelevant tests or nonexistent commands. Explicit current user instructions and applicable higher-priority instructions retain precedence. These documents create no additional permission step for routine authorized work.

New feature plans MUST state how affected principles are met, identify relevant acceptance checks, and record any intentional departures with rationale, scope, and mitigation. Small edits need only a proportional task/PR note; they do not require a new specification or approval ceremony. Existing historical plans need not be rewritten as though this constitution existed when they were created.

Amend the canonical document when policy changes, update the version/date and dependent guidance, and explain the reason. Use a major version for incompatible principle changes, minor for additional policy, and patch for clarifications. Do not silently loosen accessibility, evidence, or privacy standards to match implementation defects. If user-directed work changes a standing standard, document the specific change instead of treating a one-off exception as permanent policy.

Initial adoption establishes standards and a remediation direction. It does not assert completed redesign, working delivery, comprehensive tests, legal compliance, or a conformant existing site. The dated [site review](../../docs/content/site-review-2026-09-16.md) is supporting evidence and a suggested backlog; it is not an authorization to implement all recommendations.
