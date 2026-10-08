/** Form IDs are public routing identifiers, never arbitrary submission URLs. */
export function contactFormId(dedicated?: string, recruitment?: string): string | undefined {
  return [dedicated, recruitment].find((value) => value && /^[a-zA-Z0-9]+$/.test(value));
}
