import { getPostings, type InvertedIndex } from "./invertedIndex";
import { tokenize } from "./tokenizer";

type BooleanOperator = "AND" | "OR" | "NOT";

/**
 * Evaluates the supported simple Boolean query forms:
 * `term AND term`, `term OR term`, `term NOT term`, and `NOT term`.
 *
 * Results are returned as a new Set so callers cannot mutate the index.
 */
export function booleanSearch(
  query: string,
  invertedIndex: InvertedIndex,
  allDocumentIds: Set<string>,
): Set<string> {
  const terms = query.trim().split(/\s+/);

  if (terms.length === 2 && terms[0].toUpperCase() === "NOT") {
    return subtractSets(
      allDocumentIds,
      getTermPostings(terms[1], invertedIndex),
    );
  }

  if (terms.length !== 3) {
    throw new Error(
      "Invalid Boolean query. Use 'term AND term', 'term OR term', 'term NOT term', or 'NOT term'.",
    );
  }

  const [leftTerm, operatorText, rightTerm] = terms;
  const operator = operatorText.toUpperCase() as BooleanOperator;
  const leftPostings = getTermPostings(leftTerm, invertedIndex);
  const rightPostings = getTermPostings(rightTerm, invertedIndex);

  switch (operator) {
    case "AND":
      return intersectSets(leftPostings, rightPostings);
    case "OR":
      return unionSets(leftPostings, rightPostings);
    case "NOT":
      return subtractSets(leftPostings, rightPostings);
    default:
      throw new Error(`Unsupported Boolean operator: ${operatorText}`);
  }
}

function getTermPostings(
  term: string,
  invertedIndex: InvertedIndex,
): Set<string> {
  const normalizedTerm = tokenize(term);

  if (normalizedTerm.length !== 1) {
    throw new Error(`Invalid search term: ${term}`);
  }

  return getPostings(invertedIndex, normalizedTerm[0]);
}

function intersectSets(left: Set<string>, right: Set<string>): Set<string> {
  return new Set([...left].filter((documentId) => right.has(documentId)));
}

function unionSets(left: Set<string>, right: Set<string>): Set<string> {
  return new Set([...left, ...right]);
}

function subtractSets(left: Set<string>, right: Set<string>): Set<string> {
  return new Set([...left].filter((documentId) => !right.has(documentId)));
}
