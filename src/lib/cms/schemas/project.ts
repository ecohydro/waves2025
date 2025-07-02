import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Research Project',
  type: 'document',
  icon: RocketIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'title',
      title: 'Project Title',
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
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      description: 'Brief summary for project listings',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      description: 'Detailed project description',
      rows: 8,
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
      ],
    }),
    
    // Project Details
    defineField({
      name: 'status',
      title: 'Project Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Completed', value: 'completed' },
          { title: 'On Hold', value: 'on-hold' },
          { title: 'Planning', value: 'planning' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      description: 'When did this project begin?',
    }),
    
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      description: 'When did/will this project end?',
    }),
    
    defineField({
      name: 'researchAreas',
      title: 'Research Areas',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of research domains and keywords',
    }),
    
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for categorization and search',
    }),
    
    // Participants
    defineField({
      name: 'participants',
      title: 'Project Participants',
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
              description: 'Select lab member',
            },
            {
              name: 'externalName',
              title: 'External Collaborator Name',
              type: 'string',
              description: 'For non-lab members',
            },
            {
              name: 'role',
              title: 'Role in Project',
              type: 'string',
              description: 'e.g., Principal Investigator, Research Assistant, Collaborator',
            },
            {
              name: 'affiliation',
              title: 'Affiliation',
              type: 'string',
              description: 'Institution or organization',
            },
            {
              name: 'isPrimaryInvestigator',
              title: 'Primary Investigator',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              personName: 'person.name',
              externalName: 'externalName',
              role: 'role',
              isPrimary: 'isPrimaryInvestigator',
            },
            prepare({ personName, externalName, role, isPrimary }) {
              const name = personName || externalName || 'Unnamed Participant'
              const prefix = isPrimary ? '🔬 ' : ''
              return {
                title: `${prefix}${name}`,
                subtitle: role,
              }
            },
          },
        },
      ],
    }),
    
    // Funding and Resources
    defineField({
      name: 'funding',
      title: 'Funding Information',
      type: 'object',
      fields: [
        {
          name: 'agency',
          title: 'Funding Agency',
          type: 'string',
          description: 'e.g., NSF, NIH, DOE',
        },
        {
          name: 'grantNumber',
          title: 'Grant Number',
          type: 'string',
        },
        {
          name: 'amount',
          title: 'Funding Amount',
          type: 'number',
          description: 'Total funding amount in USD',
        },
        {
          name: 'duration',
          title: 'Duration',
          type: 'string',
          description: 'e.g., 3 years, 2020-2023',
        },
      ],
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
      description: 'Publications that resulted from this project',
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
      description: 'Other projects that are related or build upon this work',
    }),
    
    // External Links
    defineField({
      name: 'links',
      title: 'Project Links',
      type: 'object',
      fields: [
        {
          name: 'website',
          title: 'Project Website',
          type: 'url',
          description: 'Dedicated project website',
        },
        {
          name: 'repository',
          title: 'Code Repository',
          type: 'url',
          description: 'GitHub, GitLab, or other code repository',
        },
        {
          name: 'documentation',
          title: 'Documentation',
          type: 'url',
          description: 'Link to project documentation',
        },
        {
          name: 'demo',
          title: 'Demo/Prototype',
          type: 'url',
          description: 'Link to live demo or prototype',
        },
        {
          name: 'dataset',
          title: 'Dataset',
          type: 'url',
          description: 'Associated datasets or data repositories',
        },
      ],
    }),
    
    // Media Gallery
    defineField({
      name: 'gallery',
      title: 'Project Gallery',
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
      description: 'Images showcasing the project',
    }),
    
    // Technical Details
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Programming languages, frameworks, tools used',
    }),
    
    defineField({
      name: 'methods',
      title: 'Research Methods',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Research methodologies employed',
    }),
    
    // Visibility and Features
    defineField({
      name: 'isFeatured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Should this appear in featured projects?',
      initialValue: false,
    }),
    
    defineField({
      name: 'isPublic',
      title: 'Public Project',
      type: 'boolean',
      description: 'Is this project publicly visible?',
      initialValue: true,
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
          description: 'Title for search engines (leave empty to use project title)',
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
      name: 'details',
      title: 'Details',
    },
    {
      name: 'media',
      title: 'Media',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      status: 'status',
      startDate: 'startDate',
    },
    prepare({ title, media, status, startDate }) {
      const statusEmoji: Record<string, string> = {
        active: '🟢',
        completed: '✅',
        'on-hold': '⏸️',
        planning: '📋',
        cancelled: '❌',
      }
      const emoji = statusEmoji[status] || '📋'
      const year = startDate ? new Date(startDate).getFullYear() : ''
      
      return {
        title: `${emoji} ${title}`,
        subtitle: year ? `${status} (${year})` : status,
        media,
      }
    },
  },
  
  orderings: [
    {
      title: 'Start Date (Newest)',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
    {
      title: 'Start Date (Oldest)',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
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
})