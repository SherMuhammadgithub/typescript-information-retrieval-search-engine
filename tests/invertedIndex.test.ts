import { describe, expect, test } from "bun:test";
import {
  buildInvertedIndex,
  getAllDocumentIds,
  getPostings,
} from "../src/invertedIndex";
import type { Document } from "../src/types";

const documents: Document[] = [
  { id: "D01", content: "Search search engines" },
  { id: "D02", content: "Search ranking" },
  { id: "D03", content: "Indexing ranking" },
];

describe("buildInvertedIndex", () => {
  test("maps terms to every document that contains them", () => {
    const index = buildInvertedIndex(documents);

    expect(getPostings(index, "search")).toEqual(new Set(["D01", "D02"]));
    expect(getPostings(index, "ranking")).toEqual(new Set(["D02", "D03"]));
  });

  test("does not duplicate a document when a term repeats", () => {
    const index = buildInvertedIndex(documents);

    expect(getPostings(index, "search")).toEqual(new Set(["D01", "D02"]));
  });

  test("returns no postings for an unknown term", () => {
    const index = buildInvertedIndex(documents);

    expect(getPostings(index, "unknown")).toEqual(new Set());
  });

  test("returns all document IDs in deterministic order", () => {
    expect([...getAllDocumentIds(documents)]).toEqual(["D01", "D02", "D03"]);
  });
});
