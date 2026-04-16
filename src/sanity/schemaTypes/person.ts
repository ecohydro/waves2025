import { defineField, defineType } from 'sanity';

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'title', title: 'Lab Title', type: 'string' }),
    defineField({
      name: 'category',
      title: 'Role Category',
      type: 'string',
      options: {
        list: [
          { title: 'Principal Investigator', value: 'principal-investigator' },
          { title: 'Graduate Student', value: 'graduate-student' },
          { title: 'Postdoc', value: 'postdoc' },
          { title: 'Research Staff', value: 'research-staff' },
          { title: 'Research Intern', value: 'research-intern' },
          { title: 'High School Student', value: 'high-school-student' },
          { title: 'Visitor', value: 'visitor' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'userGroup',
      title: 'User Group',
      type: 'string',
      options: {
        list: [
          { title: 'Current', value: 'current' },
          { title: 'Alumni', value: 'alumni' },
          { title: 'Collaborator', value: 'collaborator' },
          { title: 'Visitor', value: 'visitor' },
        ],
        layout: 'radio',
      },
    }),
    defineField({ name: 'bio', title: 'Biography', type: 'text' }),
    defineField({ name: 'bioLong', title: 'Long Biography', type: 'text' }),
    defineField({
      name: 'researchInterests',
      title: 'Research Interests',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Legacy tags for role, affiliation, status, etc.',
    }),
    defineField({ name: 'currentPosition', title: 'Current Position', type: 'string' }),
    defineField({ name: 'institution', title: 'Institution', type: 'string' }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'joinDate', title: 'Join Date', type: 'date' }),
    defineField({ name: 'leaveDate', title: 'Leave Date', type: 'date' }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        { name: 'orcid', title: 'ORCID', type: 'string' },
        {
          name: 'googleScholar',
          title: 'Google Scholar',
          type: 'url',
          validation: (r: any) =>
            r.custom((val: string | undefined) => {
              if (!val) return true;
              try {
                const host = new URL(val).hostname.toLowerCase();
                if (host === 'waveslab.org' || host === 'www.waveslab.org')
                  return 'Please enter the actual Google Scholar URL, not a waveslab.org link';
              } catch {}
              return true;
            }),
        },
        {
          name: 'researchGate',
          title: 'ResearchGate',
          type: 'url',
          validation: (r: any) =>
            r.custom((val: string | undefined) => {
              if (!val) return true;
              try {
                const host = new URL(val).hostname.toLowerCase();
                if (host === 'waveslab.org' || host === 'www.waveslab.org')
                  return 'Please enter the actual ResearchGate URL, not a waveslab.org link';
              } catch {}
              return true;
            }),
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          validation: (r: any) =>
            r.custom((val: string | undefined) => {
              if (!val) return true;
              try {
                const host = new URL(val).hostname.toLowerCase();
                if (host === 'waveslab.org' || host === 'www.waveslab.org')
                  return 'Please enter the actual LinkedIn URL, not a waveslab.org link';
              } catch {}
              return true;
            }),
        },
        {
          name: 'twitter',
          title: 'Twitter/X',
          type: 'string',
          validation: (r: any) =>
            r.custom((val: string | undefined) => {
              if (!val || !val.includes('waveslab.org')) return true;
              return 'Please enter a Twitter/X handle or URL, not a waveslab.org link';
            }),
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'string',
          validation: (r: any) =>
            r.custom((val: string | undefined) => {
              if (!val || !val.includes('waveslab.org')) return true;
              return 'Please enter a GitHub username or URL, not a waveslab.org link';
            }),
        },
      ],
    }),
  ],
});
