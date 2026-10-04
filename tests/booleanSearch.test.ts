import { describe, expect, test } from "bun:test";
import { booleanSearch } from "../src/booleanSearch";
import { buildInvertedIndex, getAllDocumentIds } from "../src/invertedIndex";
import type { Document } from "../src/types";

const documents: Document[] = [
  { id: "D01", content: "search indexing" },
  { id: "D02", content: "search ranking" },
  { id: "D03", content: "ranking indexing" },
  { id: "D04", content: "retrieval" },
];
const invertedIndex = buildInvertedIndex(documents);
const allDocumentIds = getAllDocumentIds(documents);

describe("booleanSearch", () => {
  test("returns the intersection for AND", () => {
    expect([...booleanSearch("indexing AND ranking", invertedIndex, allDocumentIds)])
      .toEqual(["D03"]);
  });

  test("returns the union for OR", () => {
    expect([...booleanSearch("indexing OR retrieval", invertedIndex, allDocumentIds)])
      .toEqual(["D01", "D03", "D04"]);
  });

  test("returns the left-hand difference for binary NOT", () => {
    expect([...booleanSearch("ranking NOT indexing", invertedIndex, allDocumentIds)])
      .toEqual(["D02"]);
  });

  test("subtracts postings from all IDs for unary NOT", () => {
    expect([...booleanSearch("NOT ranking", invertedIndex, allDocumentIds)])
      .toEqual(["D01", "D04"]);
  });

  test("normalizes terms before lookup", () => {
    expect([...booleanSearch("SEARCH and RANKING", invertedIndex, allDocumentIds)])
      .toEqual(["D02"]);
  });

  test("returns an empty set for an unknown term", () => {
    expect(booleanSearch("unknown AND ranking", invertedIndex, allDocumentIds).size)
      .toBe(0);
  });

  test("rejects malformed queries and unknown operators", () => {
    expect(() => booleanSearch("AND ranking", invertedIndex, allDocumentIds)).toThrow();
    expect(() => booleanSearch("search XOR ranking", invertedIndex, allDocumentIds)).toThrow();
  });
});
