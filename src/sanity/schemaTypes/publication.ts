import { defineType, defineField, defineArrayMember } from 'sanity';

export const semanticScholarObject = defineType({
  name: 'semanticScholar',
  title: 'Semantic Scholar',
  type: 'object',
  fields: [
    defineField({ name: 'paperId', type: 'string' }),
    defineField({ name: 'url', type: 'url' }),
    defineField({ name: 'doi', type: 'string' }),
    defineField({
      name: 'externalIds',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'doi', type: 'string' }),
        defineField({ name: 'arXiv', type: 'string' }),
        defineField({ name: 'pubMed', type: 'string' }),
        defineField({ name: 'corpusId', type: 'string' }),
        defineField({ name: 'acl', type: 'string' }),
        defineField({ name: 'dblp', type: 'string' }),
      ],
    }),
    defineField({ name: 'abstract', type: 'text' }),
    defineField({ name: 'citationCount', type: 'number' }),
    defineField({ name: 'influentialCitationCount', type: 'number' }),
    defineField({ name: 'referenceCount', type: 'number' }),
    defineField({ name: 'isOpenAccess', type: 'boolean' }),
    defineField({ name: 'openAccessPdfUrl', type: 'url' }),
    defineField({ name: 'fieldsOfStudy', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 's2FieldsOfStudy',
      type: 'array',
      of: [
        defineArrayMember({
          name: 's2Field',
          type: 'object',
          fields: [
            defineField({ name: 'category', type: 'string' }),
            defineField({ name: 'source', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'publicationTypes', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'publicationDate', type: 'date' }),
    defineField({ name: 'tldr', type: 'text' }),
    defineField({
      name: 'venue',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'id', type: 'string' }),
      ],
    }),
    defineField({
      name: 'enhancedAuthors',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'enhancedAuthor',
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'semanticScholarId', type: 'string' }),
            defineField({ name: 'affiliations', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'homepage', type: 'url' }),
            defineField({ name: 'paperCount', type: 'number' }),
            defineField({ name: 'citationCount', type: 'number' }),
            defineField({ name: 'hIndex', type: 'number' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'lastUpdated', type: 'datetime' }),
    defineField({ name: 'status', type: 'string', options: { list: ['new', 'updated'] } }),
  ],
});

export const publication = defineType({
  name: 'publication',
  title: 'Publication',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'publicationType', type: 'string' }),
    defineField({
      name: 'authors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'isCorresponding', type: 'boolean' }),
          ],
        },
      ],
    }),
    defineField({ name: 'abstract', type: 'text' }),
    defineField({ name: 'keywords', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'venue',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'shortName', type: 'string' }),
        defineField({ name: 'volume', type: 'string' }),
        defineField({ name: 'issue', type: 'string' }),
        defineField({ name: 'pages', type: 'string' }),
        defineField({ name: 'publisher', type: 'string' }),
      ],
    }),
    defineField({ name: 'publishedDate', type: 'date' }),
    defineField({ name: 'doi', type: 'string' }),
    defineField({
      name: 'links',
      type: 'object',
      fields: [
        defineField({ name: 'publisher', type: 'url' }),
        defineField({ name: 'preprint', type: 'url' }),
      ],
    }),
    defineField({
      name: 'metrics',
      type: 'object',
      fields: [
        defineField({ name: 'citations', type: 'number' }),
        defineField({ name: 'altmetricScore', type: 'number' }),
      ],
    }),
    defineField({ name: 'status', type: 'string' }),
    defineField({ name: 'isFeatured', type: 'boolean' }),
    defineField({ name: 'isOpenAccess', type: 'boolean' }),
    defineField({
      name: 'researchAreas',
      title: 'Research Areas',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
        list: [
          { title: 'Ecohydrology', value: 'Ecohydrology' },
          { title: 'Sensors', value: 'Sensors' },
          { title: 'Coupled Natural-Human Systems', value: 'Coupled Natural-Human Systems' },
        ],
      },
    }),
    defineField({ name: 'semanticScholar', type: 'semanticScholar' }),
    defineField({ name: 'lastUpdated', title: 'Last Updated', type: 'datetime' }),
  ],
});
