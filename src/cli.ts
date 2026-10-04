import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { resolve } from "node:path";
import { booleanSearch } from "./booleanSearch";
import { loadDocuments } from "./dataLoader";
import { buildInvertedIndex, getAllDocumentIds } from "./invertedIndex";
import {
  calculateDocumentFrequency,
  createTfIdfVector,
} from "./tfidf";
import { tokenize } from "./tokenizer";
import { vectorSearch, type VectorSearchResult } from "./vectorSearch";

const dataDirectory = resolve(import.meta.dir, "../data");

/**
 * Runs the interactive search application.
 *
 * The collection and inverted index are built once at startup. Each query
 * then reuses them, while TF-IDF vectors are calculated for that query.
 */
export async function runCli(): Promise<void> {
  const documents = await loadDocuments(dataDirectory);
  const invertedIndex = buildInvertedIndex(documents);
  const allDocumentIds = getAllDocumentIds(documents);
  const readline = createInterface({ input, output });
  const lines = readline[Symbol.asyncIterator]();

  const ask = async (prompt: string): Promise<string> => {
    output.write(prompt);
    const nextLine = await lines.next();
    return nextLine.done ? "q" : nextLine.value;
  };

  console.log("Information Retrieval Search Engine");
  console.log(`Loaded ${documents.length} documents.`);

  try {
    while (true) {
      console.log("\nChoose a search mode:");
      console.log("1. Boolean search");
      console.log("2. Ranked vector search");
      console.log("3. Show inverted index");
      console.log("4. Show document TF-IDF weights");
      console.log("q. Quit");

      const mode = (await ask("Mode: ")).trim().toLowerCase();

      if (mode === "q" || mode === "quit") {
        console.log("Goodbye.");
        break;
      }

      if (mode === "3") {
        displayInvertedIndex(invertedIndex);
        continue;
      }

      if (mode === "4") {
        const documentId = (await ask("Document ID (for example DOC01, or all): "))
          .trim()
          .toUpperCase();
        displayDocumentTfIdf(documentId, documents, invertedIndex);
        continue;
      }

      if (mode !== "1" && mode !== "2") {
        console.log("Invalid mode. Please choose 1, 2, 3, 4, or q.");
        continue;
      }

      const query = (await ask("Enter query: ")).trim();

      if (query.length === 0) {
        console.log("Query cannot be empty.");
        continue;
      }

      try {
        if (mode === "1") {
          displayBooleanResults(
            booleanSearch(query, invertedIndex, allDocumentIds),
            documents,
          );
        } else {
          displayVectorResults(vectorSearch(query, documents, invertedIndex));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown search error.";
        console.log(`Search error: ${message}`);
      }
    }
  } finally {
    readline.close();
  }
}

function displayBooleanResults(
  documentIds: Set<string>,
  documents: { id: string; content: string }[],
): void {
  console.log("\nBoolean matches:");

  if (documentIds.size === 0) {
    console.log("No documents matched.");
    return;
  }

  for (const documentId of documentIds) {
    const document = documents.find((candidate) => candidate.id === documentId);
    console.log(`- ${documentId}: ${document?.content ?? "Document unavailable"}`);
  }
}

function displayVectorResults(results: VectorSearchResult[]): void {
  const matchingResults = results.filter((result) => result.score > 0);
  console.log("\nRanked vector results:");

  if (matchingResults.length === 0) {
    console.log("No documents matched the query terms.");
    return;
  }

  matchingResults.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.document.id} | Score: ${result.score.toFixed(4)} | ${result.document.content}`,
    );
  });
}

function displayInvertedIndex(
  invertedIndex: Map<string, Set<string>>,
): void {
  console.log("\nInverted index: term -> document IDs");

  for (const [term, documentIds] of [...invertedIndex].sort(([first], [second]) =>
    first.localeCompare(second),
  )) {
    console.log(`${term} -> ${[...documentIds].join(", ")}`);
  }

  console.log(`Total indexed terms: ${invertedIndex.size}`);
}

function displayDocumentTfIdf(
  requestedDocumentId: string,
  documents: { id: string; content: string }[],
  invertedIndex: Map<string, Set<string>>,
): void {
  const selectedDocuments =
    requestedDocumentId === "ALL"
      ? documents
      : documents.filter((document) => document.id === requestedDocumentId);

  if (selectedDocuments.length === 0) {
    console.log(`Document not found: ${requestedDocumentId}`);
    return;
  }

  const vocabulary = [...invertedIndex.keys()].sort();
  const documentFrequencies = calculateDocumentFrequency(invertedIndex);

  console.log("\nDocument TF-IDF weights (non-zero terms, top 10):");
  for (const document of selectedDocuments) {
    const vector = createTfIdfVector(
      tokenize(document.content),
      vocabulary,
      documentFrequencies,
      documents.length,
    );
    const weightedTerms = [...vector]
      .filter(([, weight]) => weight > 0)
      .sort(([, firstWeight], [, secondWeight]) => secondWeight - firstWeight)
      .slice(0, 10);

    console.log(`\n${document.id}:`);
    for (const [term, weight] of weightedTerms) {
      console.log(`  ${term}: ${weight.toFixed(4)}`);
    }
  }
}

if (import.meta.main) {
  await runCli();
}
