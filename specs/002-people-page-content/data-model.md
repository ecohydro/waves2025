# Data Model: People Page Content — News & Publications

**Date**: 2026-03-13

## Existing Entities (No Changes)

All entities already exist in Sanity CMS. No schema modifications required.

### Person → Publication Relationship

- **Direction**: Publication references Person via `authors[].person` (Sanity reference)
- **Cardinality**: Many-to-many (a person can author many publications; a publication has many authors)
- **Query path**: From person `_id`, find publications where `authors[].person._ref == $personId`
- **Status filter**: Only `published`, `in-press`, `accepted`
- **Sort**: `publishedDate desc`
- **Limit**: 6 (fetch 6 to detect "has more"; display only 5)

### Person → News Relationship

- **Direction**: News references Person via three paths:
  1. `author` (Sanity reference) — the primary author
  2. `coAuthors[]` (array of Sanity references) — additional authors
  3. `relatedPeople[]` (array of Sanity references) — people mentioned/featured
- **Cardinality**: Many-to-many
- **Query path**: From person `_id`, find news where `author._ref == $personId` OR `$personId in coAuthors[]._ref` OR `$personId in relatedPeople[]._ref`
- **Status filter**: Only `published`
- **Sort**: `publishedAt desc`
- **Limit**: 3

## New GROQ Queries

### `getPublicationsByPerson`

```groq
*[_type == "publication"
  && status in ["published", "in-press", "accepted"]
  && $personId in authors[].person._ref
] | order(publishedDate desc)[0...6] {
  _id,
  title,
  slug,
  publicationType,
  venue { name, shortName },
  publishedDate,
  doi,
  status
}
```

**Parameters**: `{ personId: string }` — the person's `_id`

### `getNewsByPerson`

```groq
*[_type == "news"
  && status == "published"
  && (
    author._ref == $personId
    || $personId in coAuthors[]._ref
    || $personId in relatedPeople[]._ref
  )
] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  category,
  featuredImage
}
```

**Parameters**: `{ personId: string }` — the person's `_id`

## Display Fields

### Publication Entry (on person page)
- `title` — linked to `/publications/[slug]`
- `publishedDate` — formatted as year
- `venue.name` or `venue.shortName` — journal/conference name; fallback to `publicationType` if venue is not available

### News Entry (on person page)
- `title` — linked to `/news/[slug]`
- `publishedAt` — formatted as "Month Day, Year"
- `category` — displayed as badge/tag
