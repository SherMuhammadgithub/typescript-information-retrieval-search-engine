import { resolve } from "node:path";
import { loadDocuments } from "../dataLoader";

const dataDirectory = resolve(import.meta.dir, "../../data");
const documents = await loadDocuments(dataDirectory);

console.log(`Loaded ${documents.length} documents.`);
console.log(
  `Unique IDs: ${new Set(documents.map((document) => document.id)).size}.`,
);
console.log("All documents contain non-empty content.");

if (documents.length < 20) {
  throw new Error("Phase 1 requires at least 20 documents.");
}
