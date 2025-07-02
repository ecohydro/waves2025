import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, ''),
      },
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'title',
      title: 'Job Title/Position',
      type: 'string',
      description: 'e.g., PhD Student, Postdoctoral Researcher, Professor',
    }),
    
    defineField({
      name: 'userGroup',
      title: 'User Group',
      type: 'string',
      options: {
        list: [
          { title: 'Current Member', value: 'current' },
          { title: 'Alumni', value: 'alumni' },
          { title: 'Collaborator', value: 'collaborator' },
          { title: 'Visitor', value: 'visitor' },
        ],
        layout: 'radio',
      },
      initialValue: 'current',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'avatar',
      title: 'Profile Photo',
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
      ],
    }),
    
    // Contact & Social
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'email',
    }),
    
    defineField({
      name: 'website',
      title: 'Personal Website',
      type: 'url',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https'],
      }),
    }),
    
    defineField({
      name: 'socialMedia',
      title: 'Social Media & Academic Profiles',
      type: 'object',
      fields: [
        {
          name: 'orcid',
          title: 'ORCID ID',
          type: 'string',
          description: 'Your ORCID identifier (e.g., 0000-0000-0000-0000)',
          validation: (Rule) => 
            Rule.regex(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/, {
              name: 'ORCID format',
              invert: false,
            }).warning('Please use the format: 0000-0000-0000-0000'),
        },
        {
          name: 'googleScholar',
          title: 'Google Scholar Profile URL',
          type: 'url',
          validation: (Rule) => Rule.uri({
            scheme: ['http', 'https'],
          }),
        },
        {
          name: 'researchGate',
          title: 'ResearchGate Profile URL',
          type: 'url',
          validation: (Rule) => Rule.uri({
            scheme: ['http', 'https'],
          }),
        },
        {
          name: 'linkedin',
          title: 'LinkedIn Profile URL',
          type: 'url',
          validation: (Rule) => Rule.uri({
            scheme: ['http', 'https'],
          }),
        },
        {
          name: 'twitter',
          title: 'Twitter/X Handle',
          type: 'string',
          description: 'Without @ symbol (e.g., username)',
        },
        {
          name: 'github',
          title: 'GitHub Username',
          type: 'string',
          description: 'GitHub username (without @ symbol)',
        },
      ],
    }),
    
    // Academic Information
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'degree',
              title: 'Degree',
              type: 'string',
              description: 'e.g., PhD, MS, BS',
            },
            {
              name: 'field',
              title: 'Field of Study',
              type: 'string',
              description: 'e.g., Computer Science, Environmental Engineering',
            },
            {
              name: 'institution',
              title: 'Institution',
              type: 'string',
            },
            {
              name: 'year',
              title: 'Year',
              type: 'number',
              validation: (Rule) => Rule.min(1900).max(new Date().getFullYear() + 10),
            },
          ],
          preview: {
            select: {
              degree: 'degree',
              field: 'field',
              institution: 'institution',
              year: 'year',
            },
            prepare({ degree, field, institution, year }) {
              return {
                title: `${degree} in ${field}`,
                subtitle: `${institution} (${year})`,
              }
            },
          },
        },
      ],
    }),
    
    defineField({
      name: 'researchInterests',
      title: 'Research Interests',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of research areas and interests',
    }),
    
    // Biography
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      description: 'Short biographical description',
      rows: 4,
    }),
    
    defineField({
      name: 'bioLong',
      title: 'Detailed Biography',
      type: 'text',
      description: 'Longer biographical information for full profile page',
      rows: 8,
    }),
    
    // Status and Dates
    defineField({
      name: 'joinDate',
      title: 'Join Date',
      type: 'date',
      description: 'When did this person join the lab?',
    }),
    
    defineField({
      name: 'leaveDate',
      title: 'Leave Date',
      type: 'date',
      description: 'When did this person leave the lab? (for alumni)',
      hidden: ({ document }) => document?.userGroup !== 'alumni',
    }),
    
    defineField({
      name: 'currentPosition',
      title: 'Current Position',
      type: 'string',
      description: 'Current position for alumni',
      hidden: ({ document }) => document?.userGroup !== 'alumni',
    }),
    
    defineField({
      name: 'isActive',
      title: 'Active Profile',
      type: 'boolean',
      description: 'Whether this profile should be publicly visible',
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
          description: 'Title for search engines (leave empty to use name)',
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
      name: 'seo',
      title: 'SEO',
    },
  ],
  
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'avatar',
      userGroup: 'userGroup',
    },
    prepare({ title, subtitle, media, userGroup }) {
      return {
        title,
        subtitle: subtitle ? `${subtitle} (${userGroup})` : userGroup,
        media,
      }
    },
  },
  
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Name Z-A',
      name: 'nameDesc',
      by: [{ field: 'name', direction: 'desc' }],
    },
    {
      title: 'Join Date (Newest)',
      name: 'joinDateDesc',
      by: [{ field: 'joinDate', direction: 'desc' }],
    },
    {
      title: 'Join Date (Oldest)',
      name: 'joinDateAsc',
      by: [{ field: 'joinDate', direction: 'asc' }],
    },
  ],
})