import type { InvertedIndex } from "./invertedIndex";
import { tokenize } from "./tokenizer";

export type TermFrequency = Map<string, number>;
export type TfIdfVector = Map<string, number>;

/**
 * Counts each normalized term in one token collection.
 */
export function calculateTermFrequency(tokens: string[]): TermFrequency {
  const termFrequency: TermFrequency = new Map();

  for (const token of tokens) {
    termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
  }

  return termFrequency;
}

/**
 * Calculates normalized TF so document length does not dominate ranking.
 */
export function calculateNormalizedTermFrequency(
  tokens: string[],
): TermFrequency {
  const rawFrequency = calculateTermFrequency(tokens);
  const tokenCount = tokens.length;

  if (tokenCount === 0) {
    return new Map();
  }

  return new Map(
    [...rawFrequency].map(([term, count]) => [term, count / tokenCount]),
  );
}

/**
 * Counts how many documents contain each term using the inverted index.
 */
export function calculateDocumentFrequency(
  invertedIndex: InvertedIndex,
): Map<string, number> {
  return new Map(
    [...invertedIndex].map(([term, postings]) => [term, postings.size]),
  );
}

/**
 * Uses smoothed IDF to keep weights defined and positive.
 *
 * IDF = log((number of documents + 1) / (document frequency + 1)) + 1
 */
export function calculateInverseDocumentFrequency(
  totalDocuments: number,
  documentFrequency: number,
): number {
  if (totalDocuments < 0 || documentFrequency < 0) {
    throw new Error("Document counts cannot be negative.");
  }

  return Math.log((totalDocuments + 1) / (documentFrequency + 1)) + 1;
}

/**
 * Creates a sparse TF-IDF vector over the supplied vocabulary.
 */
export function createTfIdfVector(
  tokens: string[],
  vocabulary: string[],
  documentFrequencies: Map<string, number>,
  totalDocuments: number,
): TfIdfVector {
  const normalizedTermFrequency = calculateNormalizedTermFrequency(tokens);
  const vector: TfIdfVector = new Map();

  for (const term of vocabulary) {
    const termFrequency = normalizedTermFrequency.get(term) ?? 0;
    const frequency = documentFrequencies.get(term) ?? 0;

    // A term absent from the collection cannot contribute to relevance.
    if (frequency === 0) {
      vector.set(term, 0);
      continue;
    }

    const inverseDocumentFrequency = calculateInverseDocumentFrequency(
      totalDocuments,
      frequency,
    );

    vector.set(term, termFrequency * inverseDocumentFrequency);
  }

  return vector;
}

/**
 * Tokenizes and vectorizes a query using the same TF-IDF rules as documents.
 */
export function createQueryVector(
  query: string,
  vocabulary: string[],
  documentFrequencies: Map<string, number>,
  totalDocuments: number,
): TfIdfVector {
  return createTfIdfVector(
    tokenize(query),
    vocabulary,
    documentFrequencies,
    totalDocuments,
  );
}
