import { resolve } from "node:path";
import { loadDocuments } from "../dataLoader";
import { tokenize } from "../tokenizer";

const dataDirectory = resolve(import.meta.dir, "../../data");
const documents = await loadDocuments(dataDirectory);
const tokenizedDocuments = documents.map((document) => ({
  id: document.id,
  tokens: tokenize(document.content),
}));

if (tokenize("Ranking, INDEXING! 2026.").join("|") !== "ranking|indexing|2026") {
  throw new Error("Tokenization did not normalize case, punctuation, and numbers.");
}

if (tokenize("").length !== 0) {
  throw new Error("Empty input must produce no tokens.");
}

if (tokenizedDocuments.some(({ tokens }) => tokens.length === 0)) {
  throw new Error("Every loaded document must produce at least one token.");
}

console.log(`Tokenized ${tokenizedDocuments.length} documents.`);
console.log(`First document tokens: ${tokenizedDocuments[0]?.tokens.join(", ")}`);
console.log("Case, punctuation, number, and empty-input checks passed.");
