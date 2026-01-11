import { type SchemaTypeDefinition } from 'sanity';
import { publication, semanticScholarObject } from './publication';
import { person } from './person';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [semanticScholarObject, publication, person],
};
