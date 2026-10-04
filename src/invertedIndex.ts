import type { Document } from "./types";
import { tokenize } from "./tokenizer";

/**
 * Maps each normalized term to the IDs of documents containing that term.
 */
export type InvertedIndex = Map<string, Set<string>>;

/**
 * Builds an inverted index by parsing every document and adding each
 * document ID to the postings set for its unique terms.
 *
 * A Set is used for each postings list so repeated occurrences of a term
 * in one document do not create duplicate document IDs.
 */
export function buildInvertedIndex(documents: Document[]): InvertedIndex {
  const invertedIndex: InvertedIndex = new Map();

  for (const document of documents) {
    const uniqueTerms = new Set(tokenize(document.content));

    for (const term of uniqueTerms) {
      const postings = invertedIndex.get(term) ?? new Set<string>();
      postings.add(document.id);
      invertedIndex.set(term, postings);
    }
  }

  return invertedIndex;
}

/**
 * Returns all document IDs in a stable sorted order for Boolean NOT queries
 * and deterministic result display.
 */
export function getAllDocumentIds(documents: Document[]): Set<string> {
  return new Set(
    documents
      .map((document) => document.id)
      .sort((first, second) => first.localeCompare(second, undefined, { numeric: true })),
  );
}

/**
 * Looks up a term without exposing the mutable postings set from the index.
 */
export function getPostings(
  invertedIndex: InvertedIndex,
  term: string,
): Set<string> {
  return new Set(invertedIndex.get(term) ?? []);
}
