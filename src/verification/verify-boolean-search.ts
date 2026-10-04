import { resolve } from "node:path";
import { booleanSearch } from "../booleanSearch";
import { loadDocuments } from "../dataLoader";
import { buildInvertedIndex, getAllDocumentIds } from "../invertedIndex";

const documents = await loadDocuments(resolve(import.meta.dir, "../../data"));
const invertedIndex = buildInvertedIndex(documents);
const allDocumentIds = getAllDocumentIds(documents);

const andResults = booleanSearch("indexing AND ranking", invertedIndex, allDocumentIds);
const orResults = booleanSearch("retrieval OR search", invertedIndex, allDocumentIds);
const binaryNotResults = booleanSearch(
  "ranking NOT multimedia",
  invertedIndex,
  allDocumentIds,
);
const unaryNotResults = booleanSearch("NOT ranking", invertedIndex, allDocumentIds);

if (![...andResults].every((documentId) => {
  const postings = new Set(
    documents
      .filter((document) => document.id === documentId)
      .flatMap((document) => document.content.toLowerCase().split(/\W+/)),
  );
  return postings.has("indexing") && postings.has("ranking");
})) {
  throw new Error("AND results must contain both query terms.");
}

if (orResults.size === 0 || binaryNotResults.size === 0) {
  throw new Error("OR and binary NOT queries should return matching documents.");
}

if ([...unaryNotResults].some((documentId) => {
  const document = documents.find((candidate) => candidate.id === documentId);
  return document?.content.toLowerCase().includes("ranking") ?? false;
})) {
  throw new Error("Unary NOT results must exclude documents containing ranking.");
}

let invalidQueryRejected = false;
try {
  booleanSearch("AND ranking", invertedIndex, allDocumentIds);
} catch {
  invalidQueryRejected = true;
}

if (!invalidQueryRejected) {
  throw new Error("Malformed Boolean queries must be rejected.");
}

console.log(`AND results: ${[...andResults].join(", ") || "none"}`);
console.log(`OR results: ${[...orResults].join(", ") || "none"}`);
console.log(`Binary NOT results: ${[...binaryNotResults].join(", ") || "none"}`);
console.log(`Unary NOT results: ${[...unaryNotResults].join(", ") || "none"}`);
console.log("Boolean query checks passed.");
