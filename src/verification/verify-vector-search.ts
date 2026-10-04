import { resolve } from "node:path";
import { loadDocuments } from "../dataLoader";
import { buildInvertedIndex } from "../invertedIndex";
import { createTfIdfVector } from "../tfidf";
import { cosineSimilarity, vectorSearch } from "../vectorSearch";

const documents = await loadDocuments(resolve(import.meta.dir, "../../data"));
const invertedIndex = buildInvertedIndex(documents);
const results = vectorSearch("search engine ranking", documents, invertedIndex);
const firstResult = results[0];
const queryVocabulary = ["search", "ranking"];
const firstVector = createTfIdfVector(
  [ "search", "ranking" ],
  queryVocabulary,
  new Map([
    ["search", 1],
    ["ranking", 1],
  ]),
  2,
);

if (!firstResult || firstResult.score <= 0) {
  throw new Error("A relevant query should produce a positive top score.");
}

if (results.some((result, index) => {
  const nextResult = results[index + 1];
  return nextResult !== undefined && result.score < nextResult.score;
})) {
  throw new Error("Vector results must be sorted by descending score.");
}

if (cosineSimilarity(firstVector, firstVector) < 0.999999) {
  throw new Error("Identical vectors must have cosine similarity of 1.");
}

if (cosineSimilarity(
  new Map([["search", 1]]),
  new Map([["ranking", 1]]),
) !== 0) {
  throw new Error("Orthogonal vectors must have cosine similarity of 0.");
}

if (cosineSimilarity(new Map(), firstVector) !== 0) {
  throw new Error("A zero vector must have cosine similarity of 0.");
}

console.log(`Top result: ${firstResult.document.id}`);
console.log(`Top score: ${firstResult.score.toFixed(4)}`);
console.log("Cosine similarity and vector-ranking checks passed.");
