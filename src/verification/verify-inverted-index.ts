import { resolve } from "node:path";
import { loadDocuments } from "../dataLoader";
import {
  buildInvertedIndex,
  getAllDocumentIds,
  getPostings,
} from "../invertedIndex";

const documents = await loadDocuments(resolve(import.meta.dir, "../../data"));
const invertedIndex = buildInvertedIndex(documents);
const allDocumentIds = getAllDocumentIds(documents);

const searchPostings = getPostings(invertedIndex, "search");
const uniquePostings = getPostings(invertedIndex, "tokenization");
const unknownPostings = getPostings(invertedIndex, "does-not-exist");

if (documents.length < 20) {
  throw new Error("Phase 3 requires at least 20 documents.");
}

if (allDocumentIds.size !== documents.length) {
  throw new Error("Every document must have a unique ID.");
}

if (!searchPostings.has("DOC01") || searchPostings.size < 2) {
  throw new Error("The common term 'search' should map to multiple documents.");
}

if (uniquePostings.size !== 1 || !uniquePostings.has("DOC03")) {
  throw new Error("The term 'tokenization' should map only to DOC03.");
}

if (unknownPostings.size !== 0) {
  throw new Error("Unknown terms must return an empty postings set.");
}

console.log(`Indexed ${documents.length} documents.`);
console.log(`Vocabulary size: ${invertedIndex.size} unique terms.`);
console.log(`Documents containing "search": ${[...searchPostings].join(", ")}.`);
console.log("Common, unique, unknown, and document-ID checks passed.");
