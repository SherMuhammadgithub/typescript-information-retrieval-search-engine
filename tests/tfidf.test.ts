import { describe, expect, test } from "bun:test";
import { buildInvertedIndex } from "../src/invertedIndex";
import {
  calculateDocumentFrequency,
  calculateInverseDocumentFrequency,
  calculateNormalizedTermFrequency,
  calculateTermFrequency,
  createQueryVector,
  createTfIdfVector,
} from "../src/tfidf";

describe("TF-IDF calculations", () => {
  test("counts raw term frequency", () => {
    expect(calculateTermFrequency(["search", "search", "engine"]))
      .toEqual(new Map([["search", 2], ["engine", 1]]));
  });

  test("normalizes term frequency by document length", () => {
    expect(calculateNormalizedTermFrequency(["search", "search", "engine"]).get("search"))
      .toBeCloseTo(2 / 3);
  });

  test("calculates document frequency from postings", () => {
    const index = buildInvertedIndex([
      { id: "D01", content: "search engine" },
      { id: "D02", content: "search ranking" },
    ]);

    expect(calculateDocumentFrequency(index).get("search")).toBe(2);
    expect(calculateDocumentFrequency(index).get("engine")).toBe(1);
  });

  test("gives rarer terms a higher IDF", () => {
    const commonIdf = calculateInverseDocumentFrequency(20, 10);
    const rareIdf = calculateInverseDocumentFrequency(20, 1);

    expect(rareIdf).toBeGreaterThan(commonIdf);
  });

  test("creates compatible document and query vectors", () => {
    const index = buildInvertedIndex([
      { id: "D01", content: "search search engine" },
      { id: "D02", content: "ranking engine" },
    ]);
    const frequencies = calculateDocumentFrequency(index);
    const vocabulary = ["search", "engine", "unknown"];
    const documentVector = createTfIdfVector(
      ["search", "search", "engine"],
      vocabulary,
      frequencies,
      2,
    );
    const queryVector = createQueryVector(
      "search unknown",
      vocabulary,
      frequencies,
      2,
    );

    expect(documentVector.size).toBe(queryVector.size);
    expect(queryVector.get("unknown")).toBe(0);
    expect(documentVector.get("search")).toBeGreaterThan(0);
  });
});
