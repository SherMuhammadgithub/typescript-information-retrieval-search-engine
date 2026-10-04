/**
 * Converts text into normalized terms used by indexing and searching.
 *
 * The project keeps numbers as valid terms because values such as "2026"
 * can be meaningful in a searchable collection. Stop words are also kept
 * for now so preprocessing remains predictable and lossless.
 */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}
