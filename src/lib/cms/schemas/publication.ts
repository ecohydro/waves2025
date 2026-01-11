import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';

export const publication = defineType({
  name: 'publication',
  title: 'Publication',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'title',
      title: 'Publication Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(300),
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, ''),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'publicationType',
      title: 'Publication Type',
      type: 'string',
      options: {
        list: [
          { title: 'Journal Article', value: 'journal-article' },
          { title: 'Conference Paper', value: 'conference-paper' },
          { title: 'Abstract', value: 'abstract' },
          { title: 'Book Chapter', value: 'book-chapter' },
          { title: 'Preprint', value: 'preprint' },
          { title: 'Thesis', value: 'thesis' },
          { title: 'Technical Report', value: 'report' },
          { title: 'Book', value: 'book' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'journal-article',
      validation: (Rule) => Rule.required(),
    }),

    // High-level category for site filtering
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description:
        'Conservative category assignment for site filtering. Use unknown if not certain.',
      options: {
        list: [
          { title: 'Journal Article', value: 'journal' },
          { title: 'Conference Proceedings', value: 'conference-proceedings' },
          { title: 'Conference Presentation/Abstract', value: 'conference-abstract' },
          { title: 'Preprint', value: 'preprint' },
          { title: 'Other', value: 'other' },
          { title: 'Unknown', value: 'unknown' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'unknown',
    }),

    // Authors
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'person',
              title: 'Lab Member',
              type: 'reference',
              to: [{ type: 'person' }],
              description: 'Select if this author is a lab member',
            },
            {
              name: 'name',
              title: 'Full Name',
              type: 'string',
              description: 'Required for external authors or if lab member not in system',
              validation: (Rule) =>
                Rule.custom((name, context) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const parent = context.parent as any;
                  if (!parent?.person && !name) {
                    return 'Either select a lab member or provide a name';
                  }
                  return true;
                }),
            },
            {
              name: 'affiliation',
              title: 'Affiliation',
              type: 'string',
              description: 'Institution/organization',
            },
            {
              name: 'email',
              title: 'Email',
              type: 'email',
            },
            {
              name: 'orcid',
              title: 'ORCID ID',
              type: 'string',
              validation: (Rule) =>
                Rule.regex(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/, {
                  name: 'ORCID format',
                  invert: false,
                }).warning('Please use the format: 0000-0000-0000-0000'),
            },
            {
              name: 'isCorresponding',
              title: 'Corresponding Author',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              personName: 'person.name',
              name: 'name',
              affiliation: 'affiliation',
              isCorresponding: 'isCorresponding',
            },
            prepare({ personName, name, affiliation, isCorresponding }) {
              const displayName = personName || name || 'Unnamed Author';
              const prefix = isCorresponding ? '📧 ' : '';
              return {
                title: `${prefix}${displayName}`,
                subtitle: affiliation,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    // Publication Details
    defineField({
      name: 'abstract',
      title: 'Abstract',
      type: 'text',
      description: 'Brief summary of the publication',
      rows: 6,
    }),

    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Research keywords and topics',
    }),

    // Journal/Conference Information
    defineField({
      name: 'venue',
      title: 'Publication Venue',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Journal/Conference Name',
          type: 'string',
          description: 'Full name of the journal or conference',
        },
        {
          name: 'shortName',
          title: 'Short Name/Abbreviation',
          type: 'string',
          description: 'Common abbreviation (e.g., ICML, Nature)',
        },
        {
          name: 'location',
          title: 'Location',
          type: 'string',
          description: 'City, State/Region, Country (e.g., Washington, DC)',
        },
        {
          name: 'volume',
          title: 'Volume',
          type: 'string',
        },
        {
          name: 'issue',
          title: 'Issue/Number',
          type: 'string',
        },
        {
          name: 'pages',
          title: 'Pages',
          type: 'string',
          description: 'Page range (e.g., 123-145)',
        },
        {
          name: 'publisher',
          title: 'Publisher',
          type: 'string',
        },
      ],
    }),

    // Dates
    defineField({
      name: 'publishedDate',
      title: 'Publication Date',
      type: 'date',
      description: 'Official publication date',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'submittedDate',
      title: 'Submission Date',
      type: 'date',
      description: 'When was this submitted?',
    }),

    defineField({
      name: 'acceptedDate',
      title: 'Acceptance Date',
      type: 'date',
      description: 'When was this accepted?',
    }),

    // Identifiers and Links
    defineField({
      name: 'doi',
      title: 'DOI',
      type: 'string',
      description: 'Digital Object Identifier (e.g., 10.1000/xyz123)',
      validation: (Rule) =>
        Rule.regex(/^10\.\d{4,}\/\S+$/, {
          name: 'DOI format',
          invert: false,
        }).warning('Please use the format: 10.xxxx/xxxxx'),
    }),

    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
      description: 'For books and book chapters',
      validation: (Rule) =>
        Rule.regex(
          /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
          {
            name: 'ISBN format',
            invert: false,
          },
        ).warning('Please enter a valid ISBN'),
    }),

    defineField({
      name: 'pmid',
      title: 'PubMed ID',
      type: 'string',
      description: 'PubMed identifier for medical/life sciences papers',
    }),

    defineField({
      name: 'arxivId',
      title: 'arXiv ID',
      type: 'string',
      description: 'arXiv identifier for preprints (e.g., 2301.12345)',
      validation: (Rule) =>
        Rule.regex(/^\d{4}\.[\d]{4,5}(v\d+)?$/, {
          name: 'arXiv format',
          invert: false,
        }).warning('Please use the format: YYMM.NNNNN or YYMM.NNNNNvN'),
    }),

    // Semantic Scholar metadata (source-of-truth for S2 integration)
    defineField({
      name: 'semanticScholar',
      title: 'Semantic Scholar',
      type: 'object',
      fields: [
        {
          name: 'paperId',
          title: 'Paper ID',
          type: 'string',
          description: 'Semantic Scholar paperId (e.g., 8cd974b7...)',
        },
        {
          name: 'url',
          title: 'Semantic Scholar URL',
          type: 'url',
        },
        {
          name: 'publicationTypes',
          title: 'Publication Types',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'venue',
          title: 'S2 Venue',
          type: 'object',
          fields: [
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'shortName', title: 'Short Name', type: 'string' },
          ],
        },
        {
          name: 'isOpenAccess',
          title: 'Open Access (S2)',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'authors',
          title: 'Authors (S2)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', title: 'Name', type: 'string' },
                { name: 'authorId', title: 'Author ID', type: 'string' },
              ],
              preview: {
                select: { name: 'name', authorId: 'authorId' },
                prepare({ name, authorId }) {
                  return { title: name || 'Unknown', subtitle: authorId };
                },
              },
            },
          ],
        },
        {
          name: 'lastUpdated',
          title: 'Last Updated (S2)',
          type: 'datetime',
        },
      ],
      group: 'metadata',
    }),

    // Links and Files
    defineField({
      name: 'links',
      title: 'Links',
      type: 'object',
      fields: [
        {
          name: 'publisher',
          title: 'Publisher URL',
          type: 'url',
          description: 'Official publication URL',
        },
        {
          name: 'preprint',
          title: 'Preprint URL',
          type: 'url',
          description: 'Link to preprint version (arXiv, bioRxiv, etc.)',
        },
        {
          name: 'pdf',
          title: 'PDF File',
          type: 'file',
          description: 'Upload the publication PDF',
        },
        {
          name: 'supplementary',
          title: 'Supplementary Materials',
          type: 'url',
          description: 'Link to supplementary materials',
        },
        {
          name: 'code',
          title: 'Code Repository',
          type: 'url',
          description: 'Link to code/data repository (GitHub, etc.)',
        },
        {
          name: 'dataset',
          title: 'Dataset',
          type: 'url',
          description: 'Link to associated datasets',
        },
      ],
    }),

    // Metrics and Impact
    defineField({
      name: 'metrics',
      title: 'Publication Metrics',
      type: 'object',
      fields: [
        {
          name: 'citations',
          title: 'Citation Count',
          type: 'number',
          description: 'Number of citations (manually entered or fetched)',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'altmetricScore',
          title: 'Altmetric Score',
          type: 'number',
          description: 'Altmetric attention score',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'impactFactor',
          title: 'Journal Impact Factor',
          type: 'number',
          description: 'Journal impact factor (if applicable)',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'quartile',
          title: 'Journal Quartile',
          type: 'string',
          options: {
            list: [
              { title: 'Q1', value: 'Q1' },
              { title: 'Q2', value: 'Q2' },
              { title: 'Q3', value: 'Q3' },
              { title: 'Q4', value: 'Q4' },
            ],
          },
        },
      ],
    }),

    // Status and Visibility
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'In Press', value: 'in-press' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Under Review', value: 'under-review' },
          { title: 'Submitted', value: 'submitted' },
          { title: 'In Preparation', value: 'in-preparation' },
          { title: 'Preprint', value: 'preprint' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'published',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'isFeatured',
      title: 'Featured Publication',
      type: 'boolean',
      description: 'Should this appear in featured publications?',
      initialValue: false,
    }),

    defineField({
      name: 'isOpenAccess',
      title: 'Open Access',
      type: 'boolean',
      description: 'Is this publication open access?',
      initialValue: false,
    }),

    // SEO and Metadata
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Title for search engines (leave empty to use publication title)',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Description for search engines',
          validation: (Rule) => Rule.max(160),
          rows: 3,
        },
      ],
      group: 'seo',
    }),
  ],

  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'metadata',
      title: 'Metadata',
    },
    {
      name: 'metrics',
      title: 'Metrics',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'venue.name',
      date: 'publishedDate',
      status: 'status',
      type: 'publicationType',
    },
    prepare({ title, subtitle, date, status, type }) {
      const year = date ? new Date(date).getFullYear() : 'No date';
      const statusEmoji: Record<string, string> = {
        published: '✅',
        'in-press': '🔄',
        accepted: '✅',
        'under-review': '👀',
        submitted: '📤',
        'in-preparation': '✏️',
        preprint: '📄',
      };
      const emoji = statusEmoji[status] || '📄';

      return {
        title: `${emoji} ${title}`,
        subtitle: subtitle ? `${subtitle} (${year})` : `${type} (${year})`,
      };
    },
  },

  orderings: [
    {
      title: 'Publication Date (Newest)',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Publication Date (Oldest)',
      name: 'publishedDateAsc',
      by: [{ field: 'publishedDate', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
});
