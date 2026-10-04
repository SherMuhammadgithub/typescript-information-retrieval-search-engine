import { describe, expect, test } from "bun:test";
import { buildInvertedIndex } from "../src/invertedIndex";
import { createTfIdfVector } from "../src/tfidf";
import {
  cosineSimilarity,
  dotProduct,
  vectorMagnitude,
  vectorSearch,
} from "../src/vectorSearch";

describe("vector similarity", () => {
  test("calculates dot product and magnitude", () => {
    const vector = new Map([
      ["search", 3],
      ["ranking", 4],
    ]);

    expect(dotProduct(vector, vector)).toBe(25);
    expect(vectorMagnitude(vector)).toBe(5);
  });

  test("returns one for identical vectors", () => {
    const vector = new Map([
      ["search", 1],
      ["ranking", 2],
    ]);

    expect(cosineSimilarity(vector, vector)).toBeCloseTo(1);
  });

  test("returns zero for orthogonal and zero vectors", () => {
    expect(
      cosineSimilarity(new Map([["search", 1]]), new Map([["ranking", 1]])),
    ).toBe(0);
    expect(cosineSimilarity(new Map(), new Map([["search", 1]]))).toBe(0);
  });
});

describe("vectorSearch", () => {
  test("ranks documents by query similarity", () => {
    const documents = [
      { id: "D01", content: "search ranking" },
      { id: "D02", content: "search" },
      { id: "D03", content: "retrieval" },
    ];
    const index = buildInvertedIndex(documents);
    const results = vectorSearch("search ranking", documents, index);

    expect(results[0]?.document.id).toBe("D01");
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
    expect(results[1]?.score).toBeGreaterThan(results[2]?.score ?? 0);
  });

  test("uses document ID as a tie-breaker", () => {
    const documents = [
      { id: "D02", content: "search" },
      { id: "D01", content: "search" },
    ];
    const results = vectorSearch(
      "search",
      documents,
      buildInvertedIndex(documents),
    );

    expect(results.map((result) => result.document.id)).toEqual(["D01", "D02"]);
  });
});
