# Data Model: Member Publications & News

**Feature**: 003-member-publications-news
**Date**: 2026-03-21

## Entities

### Person (existing - no changes)

| Field | Type | Notes |
|-------|------|-------|
| _id | string | Sanity document ID, used for reference matching |
| name | string | Display name |
| slug | { current: string } | URL slug, used in "View all" links |
| userGroup | 'current' \| 'alumni' \| ... | No impact on publications/news display |

### Publication (existing - schema update needed)

| Field | Type | Notes |
|-------|------|-------|
| _id | string | Sanity document ID |
| title | string | Displayed on member page |
| slug | { current: string } | Used for detail page link |
| publicationType | string enum | Used to filter out 'abstract' type |
| authors[] | array of objects | Each has optional `person` reference + `name` |
| authors[].person | reference to Person | **SCHEMA UPDATE**: Add to `publication.ts` |
| authors[].name | string | Fallback display name |
| authors[].isCorresponding | boolean | Not displayed on member page |
| venue | object | `name` and `shortName` displayed |
| publishedDate | date | Sort key and display year |
| doi | string | Optional, not displayed on member page |

**Schema change required**: Add `person` reference field to the `authors` array member in `/src/sanity/schemaTypes/publication.ts`:

```typescript
defineField({
  name: 'person',
  title: 'Lab Member',
  type: 'reference',
  to: [{ type: 'person' }],
  description: 'Link to lab member profile (if applicable)',
})
```

### News (existing - no changes)

| Field | Type | Notes |
|-------|------|-------|
| _id | string | Sanity document ID |
| title | string | Displayed on member page |
| slug | { current: string } | Used for detail page link |
| excerpt | string | Displayed on member page (truncated) |
| featuredImage | image object | Thumbnail displayed if present |
| publishedAt | datetime | Sort key and display date |
| category | string enum | Displayed as badge |
| status | string enum | Only 'published' shown |
| author | reference to Person | Matched against current person |
| coAuthors[] | reference[] to Person | Matched against current person |
| relatedPeople[] | reference[] to Person | Matched against current person |

## Relationships

```
Person (1) ←──referenced by──→ (many) Publication.authors[].person
Person (1) ←──referenced by──→ (many) News.author
Person (1) ←──referenced by──→ (many) News.coAuthors[]
Person (1) ←──referenced by──→ (many) News.relatedPeople[]
```

All relationships are existing Sanity references. No new relationship types are introduced.

## Query Patterns

### Fetch publications for a person

- Input: `personId` (Sanity document `_id`)
- Filter: `references($personId)` AND `publicationType != "abstract"`
- Sort: `publishedDate desc`
- Limit: 6 (display 5, use 6th to determine "View all" visibility)
- Returns: title, slug, authors (with dereferenced person), venue.name, publishedDate

### Fetch news for a person

- Input: `personId` (Sanity document `_id`)
- Filter: `author._ref == $personId` OR `$personId in coAuthors[]._ref` OR `$personId in relatedPeople[]._ref`, AND `status == "published"`
- Sort: `publishedAt desc`
- Limit: 4 (display 3, use 4th to determine "View all" visibility)
- Returns: title, slug, excerpt, featuredImage, publishedAt, category

### Filter publications by author (publications page)

- Input: `authorSlug` (from URL query param `?author=slug`)
- Filter: client-side filter on already-fetched publications, checking `authors[].person?.slug.current === authorSlug`
- Applied after existing type/area filters
