import { defineField, defineType } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export const news = defineType({
  name: 'news',
  title: 'News & Updates',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'title',
      title: 'Post Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, ''),
      },
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief summary for listings and social media',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Main content of the post (supports markdown)',
      rows: 15,
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional image caption',
        },
        {
          name: 'credit',
          type: 'string',
          title: 'Photo Credit',
          description: 'Photographer or image source',
        },
      ],
    }),
    
    // Publication Details
    defineField({
      name: 'publishedAt',
      title: 'Publication Date',
      type: 'datetime',
      description: 'When should this post be published?',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'Who wrote this post?',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'coAuthors',
      title: 'Co-Authors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'person' }],
        },
      ],
      description: 'Additional authors for this post',
    }),
    
    // Categorization
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Research Update', value: 'research' },
          { title: 'Publication Announcement', value: 'publication' },
          { title: 'Lab News', value: 'lab-news' },
          { title: 'Conference Report', value: 'conference' },
          { title: 'Award/Achievement', value: 'award' },
          { title: 'Outreach', value: 'outreach' },
          { title: 'Collaboration', value: 'collaboration' },
          { title: 'Event', value: 'event' },
          { title: 'General', value: 'general' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'general',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for categorization and search',
    }),
    
    // Related Content
    defineField({
      name: 'relatedPublications',
      title: 'Related Publications',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'publication' }],
        },
      ],
      description: 'Publications mentioned or featured in this post',
    }),
    
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
      description: 'Projects mentioned or featured in this post',
    }),
    
    defineField({
      name: 'relatedPeople',
      title: 'Featured People',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'person' }],
        },
      ],
      description: 'People mentioned or featured in this post (beyond authors)',
    }),
    
    // External Links
    defineField({
      name: 'externalLinks',
      title: 'External Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Link Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'string',
              description: 'Brief description of what this link contains',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
          },
        },
      ],
      description: 'Relevant external links mentioned in the post',
    }),
    
    // Media Gallery
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'credit',
              type: 'string',
              title: 'Photo Credit',
            },
          ],
        },
      ],
      description: 'Additional images for this post',
    }),
    
    // Publication Status
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'isFeatured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Should this appear in featured posts on homepage?',
      initialValue: false,
    }),
    
    defineField({
      name: 'isSticky',
      title: 'Sticky Post',
      type: 'boolean',
      description: 'Should this post stay at the top of listings?',
      initialValue: false,
    }),
    
    // Social Media
    defineField({
      name: 'socialMedia',
      title: 'Social Media Settings',
      type: 'object',
      fields: [
        {
          name: 'twitterText',
          title: 'Twitter Text',
          type: 'text',
          description: 'Custom text for Twitter sharing',
          validation: (Rule) => Rule.max(280),
          rows: 3,
        },
        {
          name: 'linkedinText',
          title: 'LinkedIn Text',
          type: 'text',
          description: 'Custom text for LinkedIn sharing',
          rows: 4,
        },
        {
          name: 'hashtags',
          title: 'Social Media Hashtags',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Hashtags for social media sharing',
        },
      ],
      group: 'social',
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
          description: 'Title for search engines (leave empty to use post title)',
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
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Keywords for search optimization',
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'Canonical URL if this content exists elsewhere',
        },
      ],
      group: 'seo',
    }),
    
    // Analytics
    defineField({
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      readOnly: true,
      fields: [
        {
          name: 'views',
          title: 'Page Views',
          type: 'number',
          description: 'Total page views (auto-populated)',
        },
        {
          name: 'lastViewed',
          title: 'Last Viewed',
          type: 'datetime',
          description: 'Last time this post was viewed',
        },
        {
          name: 'socialShares',
          title: 'Social Shares',
          type: 'number',
          description: 'Number of social media shares',
        },
      ],
      group: 'analytics',
    }),
  ],
  
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'media',
      title: 'Media',
    },
    {
      name: 'social',
      title: 'Social Media',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
    {
      name: 'analytics',
      title: 'Analytics',
    },
  ],
  
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      author: 'author.name',
      publishedAt: 'publishedAt',
      status: 'status',
      category: 'category',
    },
    prepare({ title, media, author, publishedAt, status, category }) {
      const statusEmoji: Record<string, string> = {
        draft: '📝',
        published: '✅',
        scheduled: '⏰',
        archived: '📦',
      }
      const emoji = statusEmoji[status] || '📝'
      
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      const subtitle = `${category} • ${author} • ${date}`
      
      return {
        title: `${emoji} ${title}`,
        subtitle,
        media,
      }
    },
  },
  
  orderings: [
    {
      title: 'Publication Date (Newest)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Publication Date (Oldest)',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Category',
      name: 'category',
      by: [{ field: 'category', direction: 'asc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
})