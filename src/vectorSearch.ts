import type { Document } from "./types";
import {
  calculateDocumentFrequency,
  createQueryVector,
  createTfIdfVector,
  type TfIdfVector,
} from "./tfidf";
import type { InvertedIndex } from "./invertedIndex";
import { tokenize } from "./tokenizer";

export interface VectorSearchResult {
  document: Document;
  score: number;
}

/**
 * Calculates the dot product of two vectors with matching term dimensions.
 */
export function dotProduct(first: TfIdfVector, second: TfIdfVector): number {
  let total = 0;

  for (const [term, firstWeight] of first) {
    total += firstWeight * (second.get(term) ?? 0);
  }

  return total;
}

/**
 * Calculates a vector's Euclidean length.
 */
export function vectorMagnitude(vector: TfIdfVector): number {
  const squaredTotal = [...vector.values()].reduce(
    (total, weight) => total + weight ** 2,
    0,
  );

  return Math.sqrt(squaredTotal);
}

/**
 * Compares two TF-IDF vectors by their angle.
 *
 * A zero vector has no direction, so it receives a similarity of zero.
 */
export function cosineSimilarity(
  first: TfIdfVector,
  second: TfIdfVector,
): number {
  const denominator = vectorMagnitude(first) * vectorMagnitude(second);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct(first, second) / denominator;
}

/**
 * Ranks every document against the query using one shared vocabulary.
 */
export function vectorSearch(
  query: string,
  documents: Document[],
  invertedIndex: InvertedIndex,
): VectorSearchResult[] {
  const vocabulary = [...invertedIndex.keys()].sort();
  const documentFrequencies = calculateDocumentFrequency(invertedIndex);
  const queryVector = createQueryVector(
    query,
    vocabulary,
    documentFrequencies,
    documents.length,
  );

  return documents
    .map((document): VectorSearchResult => {
      const documentVector = createTfIdfVector(
        tokenize(document.content),
        vocabulary,
        documentFrequencies,
        documents.length,
      );

      return {
        document,
        score: cosineSimilarity(queryVector, documentVector),
      };
    })
    .sort((first, second) => {
      const scoreDifference = second.score - first.score;
      return scoreDifference !== 0
        ? scoreDifference
        : first.document.id.localeCompare(second.document.id, undefined, {
            numeric: true,
          });
    });
}
