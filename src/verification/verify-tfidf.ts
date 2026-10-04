import { resolve } from "node:path";
import { loadDocuments } from "../dataLoader";
import {
  buildInvertedIndex,
} from "../invertedIndex";
import {
  calculateDocumentFrequency,
  calculateInverseDocumentFrequency,
  calculateNormalizedTermFrequency,
  createQueryVector,
  createTfIdfVector,
} from "../tfidf";
import { tokenize } from "../tokenizer";

const documents = await loadDocuments(resolve(import.meta.dir, "../../data"));
const invertedIndex = buildInvertedIndex(documents);
const documentFrequencies = calculateDocumentFrequency(invertedIndex);
const commonTermFrequency = documentFrequencies.get("search") ?? 0;
const rareTermFrequency = documentFrequencies.get("tokenization") ?? 0;
const searchIdf = calculateInverseDocumentFrequency(documents.length, commonTermFrequency);
const tokenizationIdf = calculateInverseDocumentFrequency(
  documents.length,
  rareTermFrequency,
);
const sampleTokens = tokenize("search search ranking");
const sampleTf = calculateNormalizedTermFrequency(sampleTokens);
const vocabulary = ["search", "ranking", "unknown"];
const documentVector = createTfIdfVector(
  sampleTokens,
  vocabulary,
  documentFrequencies,
  documents.length,
);
const queryVector = createQueryVector(
  "search unknown",
  vocabulary,
  documentFrequencies,
  documents.length,
);

if (sampleTf.get("search") !== 2 / 3) {
  throw new Error("Repeated terms must increase normalized term frequency.");
}

if (tokenizationIdf <= searchIdf) {
  throw new Error("A rarer term must have a higher IDF than a common term.");
}

if (documentVector.size !== vocabulary.length || queryVector.size !== vocabulary.length) {
  throw new Error("Document and query vectors must use the same vocabulary.");
}

if (queryVector.get("unknown") !== 0) {
  throw new Error("An unknown query term must have zero TF-IDF weight.");
}

console.log(`Document frequency for "search": ${commonTermFrequency}.`);
console.log(`Document frequency for "tokenization": ${rareTermFrequency}.`);
console.log(`IDF search: ${searchIdf.toFixed(4)}.`);
console.log(`IDF tokenization: ${tokenizationIdf.toFixed(4)}.`);
console.log("TF-IDF and query-vector checks passed.");
