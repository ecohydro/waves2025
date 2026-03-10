# Data Model: UC Accessibility Compliance

**Date**: 2026-03-10
**Feature**: 001-uc-accessibility

## Overview

This feature does not introduce new data entities. It modifies the presentation and behavior of existing entities. The data model changes are limited to Sanity CMS schema validation.

## Existing Entities (No Changes Required)

### Sanity CMS Image Fields

Alt text is **already required** across all schemas:

| Schema | Image Field | Alt Text Status | Action |
|--------|------------|----------------|--------|
| News (`news.ts`) | featuredImage | Required (validated) | None |
| News (`news.ts`) | gallery images | Required (validated) | None |
| Person (`person.ts`) | avatar | Required (validated) | None |
| Project (`project.ts`) | featuredImage | Required (validated) | None |

**Finding**: The clarification to enforce alt text at the schema level is already implemented. No schema changes needed.

## Page Structure Model (Presentation Layer)

Each page must conform to this landmark structure:

```
Page
├── Skip Link (visually hidden, first focusable element)
├── Header
│   └── Navigation (role="navigation", aria-label="Main navigation")
├── Main Content (id="main-content", role="main")
│   ├── h1 (exactly one per page)
│   ├── Sections
│   │   ├── h2
│   │   │   ├── h3 (optional)
│   │   │   └── Content
│   │   └── h2
│   │       └── Content
│   └── Dynamic regions (aria-live="polite" for updates)
└── Footer (role="contentinfo")
    └── Accessibility Statement link
```

## Modal Dialog Structure

```
Modal Overlay (onClick → close)
└── Modal Container (role="dialog", aria-modal="true", aria-labelledby="modal-title")
    ├── Modal Title (id="modal-title")
    ├── Modal Content (aria-describedby if applicable)
    └── Close Button (aria-label="Close modal")
    [Focus trapped within container]
    [Escape key → close and restore focus to trigger]
```

## Form Structure

```
Form
├── Field Group
│   ├── Label (htmlFor → input id)
│   ├── Input (id, aria-required, aria-invalid, aria-describedby → error)
│   └── Error Message (id, role="alert")
├── Submit Button
└── Status Message (aria-live="polite")
```
