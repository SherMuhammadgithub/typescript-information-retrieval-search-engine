import { describe, expect, test } from "bun:test";
import { tokenize } from "../src/tokenizer";

describe("tokenize", () => {
  test("normalizes case and removes punctuation", () => {
    expect(tokenize("Ranking, INDEXING!")).toEqual(["ranking", "indexing"]);
  });

  test("keeps numbers as searchable terms", () => {
    expect(tokenize("IR 2026")).toEqual(["ir", "2026"]);
  });

  test("collapses whitespace between terms", () => {
    expect(tokenize("search   engine\tresults")).toEqual([
      "search",
      "engine",
      "results",
    ]);
  });

  test("returns an empty array for empty or punctuation-only input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("...!?")).toEqual([]);
  });
});
