import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
// Temporarily disabled due to compatibility issues
// import { media } from 'sanity-plugin-media';

// Import schema types
import { person } from './schemas/person';
import { publication } from './schemas/publication';
import { project } from './schemas/project';
import { news } from './schemas/news';

const projectId = '6r5yojda';
const dataset = 'production';

export default defineConfig({
  name: 'waves-research-lab',
  title: 'WAVES Research Lab CMS',

  projectId,
  dataset,

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // People
            S.listItem()
              .title('People')
              .child(
                S.list()
                  .title('People')
                  .items([
                    S.listItem()
                      .title('Current Members')
                      .child(
                        S.documentTypeList('person')
                          .title('Current Members')
                          .filter('_type == "person" && userGroup == "current"'),
                      ),
                    S.listItem()
                      .title('Alumni')
                      .child(
                        S.documentTypeList('person')
                          .title('Alumni')
                          .filter('_type == "person" && userGroup == "alumni"'),
                      ),
                    S.listItem()
                      .title('All People')
                      .child(S.documentTypeList('person').title('All People')),
                  ]),
              ),

            // Publications
            S.listItem()
              .title('Publications')
              .child(
                S.list()
                  .title('Publications')
                  .items([
                    S.listItem()
                      .title('Journal Articles')
                      .child(
                        S.documentTypeList('publication')
                          .title('Journal Articles')
                          .filter('_type == "publication" && publicationType == "journal-article"'),
                      ),
                    S.listItem()
                      .title('Conference Papers')
                      .child(
                        S.documentTypeList('publication')
                          .title('Conference Papers')
                          .filter(
                            '_type == "publication" && publicationType == "conference-paper"',
                          ),
                      ),
                    S.listItem()
                      .title('Preprints')
                      .child(
                        S.documentTypeList('publication')
                          .title('Preprints')
                          .filter('_type == "publication" && publicationType == "preprint"'),
                      ),
                    S.listItem()
                      .title('All Publications')
                      .child(S.documentTypeList('publication').title('All Publications')),
                  ]),
              ),

            // Projects
            S.listItem()
              .title('Research Projects')
              .child(S.documentTypeList('project').title('Research Projects')),

            // News
            S.listItem()
              .title('News & Updates')
              .child(S.documentTypeList('news').title('News & Updates')),
          ]),
    }),
    visionTool({
      defaultApiVersion: '2023-12-19',
      defaultDataset: dataset,
    }),
    // Temporarily disabled due to compatibility issues
    // media(),
  ],

  schema: {
    types: [person, publication, project, news],
  },

  tools: (prev) => {
    // If not in production, show all tools
    if (process.env.NODE_ENV !== 'production') {
      return prev;
    }

    // In production, hide vision tool for security
    return prev.filter((tool) => tool.name !== 'vision');
  },
});

export const apiVersion = '2023-12-19';
