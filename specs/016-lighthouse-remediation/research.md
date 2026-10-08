# Research and decisions

## Existing evidence

The conversation reports Lighthouse 13.5.0 live mobile/desktop accessibility scores of home 96, research 96, Ecohydrology 96, people 92, Kelly Caylor profile 93, publications 92, and Join the Lab 97. Reports are recorded at `/Users/kellycaylor/Downloads/waves-lighthouse-2026-09-23/README.md`. These are reported historical results, not newly verified measurements in this document.

The checkout already includes changes for navigation, research heroes, footer contrast, publication filters, and other independent improvements. Baseline comparison must not imply that all differences from production arise from feature 016.

## Decisions

- **Decision**: Scope fixes to identified repeated defects and their same-component variants.
  **Rationale**: User requested easy improvements with broad benefit.
  **Alternative**: A comprehensive redesign or audit would expand scope and obscure causality.
- **Decision**: Keep the shared working branch and use explicit feature-directory overrides for Spec Kit scripts.
  **Rationale**: Many unrelated edits already exist; switching branches risks disruption. `SPECIFY_FEATURE` alone did not locate the new directory with this installed script, so also use `SPECIFY_FEATURE_DIRECTORY`.
  **Alternative**: Branch creation/worktree copying could misrepresent ownership of prior edits.
- **Decision**: Prefer readable scoped styles, persistent underlines, and sibling semantic links.
  **Rationale**: They directly address reported failures with existing framework conventions and no new service.
  **Alternative**: Suppressing audits, overriding global colors indiscriminately, or click handlers would not reliably fix usability.
- **Decision**: Use 44-pixel social targets and browser reflow checks.
  **Rationale**: Generous targets improve touch selection and avoid dependence on tightly spaced icons.
  **Alternative**: Tiny icons with spacing alone would be less usable despite possible automated exceptions.
- **Decision**: Retain actual validation failures and limitations in the report.
  **Rationale**: Constitution V/VI requires honest, proportional evidence; no score establishes site-wide conformance.
  **Alternative**: Claiming production improvements from a local audit would overstate delivery.

No unresolved technical decisions remain for this limited implementation.
