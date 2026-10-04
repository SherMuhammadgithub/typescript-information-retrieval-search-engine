# Boolean and Vector Space Search Engine Implementation Plan

## 1. Project Goal

Build a small searchable information-retrieval system that:

1. Stores at least 20 documents with unique document IDs.
2. Tokenizes and normalizes document text.
3. Builds an inverted index from terms to document IDs.
4. Supports Boolean `AND`, `OR`, and `NOT` queries.
5. Calculates TF-IDF weights for documents and queries.
6. Ranks matching documents using cosine similarity.
7. Displays Boolean matches and ranked vector-space results clearly.

The implementation should be written in TypeScript, remain dependency-light, and be easy to demonstrate from the command line. A frontend is not required for the core project.

## 2. Suggested Project Structure

Use this structure unless an existing course requirement specifies another one:

```text
project/
├── data/
│   ├── doc01.txt
│   ├── doc02.txt
│   ├── ...
│   └── doc20.txt
├── src/
│   ├── types.ts
│   ├── dataLoader.ts
│   ├── tokenizer.ts
│   ├── invertedIndex.ts
│   ├── booleanSearch.ts
│   ├── tfidf.ts
│   ├── vectorSearch.ts
│   └── cli.ts
├── tests/
│   ├── tokenizer.test.ts
│   ├── booleanSearch.test.ts
│   └── vectorSearch.test.ts
├── package.json
├── tsconfig.json
└── IMPLEMENTATION_PLAN.md
```

Use separate `.txt` files so the loader demonstrates how a searchable document collection is read from disk. Keep the inverted index, TF-IDF data, and cosine-similarity calculations in memory. A database and Docker are not required for the core assignment.

## 3. Functional Requirements

## 4. Code Quality and Readability Standards

The implementation must prioritize clarity and learning value over clever or overly compact code.

### Understandable Code

- Use descriptive names such as `documentFrequency`, `invertedIndex`, `queryVector`, and `cosineSimilarity`.
- Keep functions small and focused on one responsibility.
- Separate document loading, tokenization, indexing, Boolean search, TF-IDF, vector math, and CLI responsibilities into different modules.
- Add explicit TypeScript types for documents, search results, indexes, vectors, and function parameters and return values.
- Prefer straightforward control flow over dense one-line expressions.
- Avoid unnecessary abstractions, duplicated logic, unexplained constants, and unsafe casts.
- Reuse the same tokenizer and normalization logic for both documents and user queries.
- Keep output formatting separate from search and ranking calculations.

### Proper Comments

- Add comments where they explain an algorithm, formula, non-obvious decision, or edge-case guard.
- Explain the TF, IDF, TF-IDF, and cosine-similarity formulas near their implementations.
- Explain why a full document-ID set is needed for unary `NOT` queries.
- Explain any stop-word policy, smoothing choice, or tie-breaking rule.
- Do not write comments that merely repeat the code, such as `// loop through documents`.
- Keep comments accurate and update them whenever the related implementation changes.
- Add JSDoc comments to exported functions when their inputs, outputs, or behavior are not obvious.

### Documentation Expectations

- Include a short README or usage section once implementation begins.
- Document how to install dependencies, build the TypeScript code, run the CLI, and run tests.
- Include example Boolean and vector queries with representative output.
- Record assumptions and limitations, including the initial support for simple Boolean expressions.

### Dataset

- Include at least 20 documents.
- Assign stable IDs such as `D01` through `D20`.
- Make the documents related to information retrieval, search engines, indexing, ranking, text processing, and similar topics.
- Ensure some terms occur in multiple documents and some terms occur only once so TF-IDF differences can be observed.

### Preprocessing

- Convert text to lowercase.
- Extract word tokens consistently.
- Ignore punctuation.
- Decide whether to remove stop words. For a simple implementation, either:
  - keep all tokens and document the choice, or
  - remove a small, clearly defined stop-word list.
- Use the same preprocessing function for documents and user queries.

### Inverted Index

Create a mapping with this shape:

```typescript
{
  "indexing": new Set(["D01", "D04", "D12"]),
  "ranking": new Set(["D02", "D04"]),
}
```

Each unique token is a key, and its value is the set of document IDs containing that token. Sets are appropriate because a document should appear only once per term in the postings list.

### Boolean Model

Support:

- `term1 AND term2`: intersection of postings sets.
- `term1 OR term2`: union of postings sets.
- `term1 NOT term2`: documents containing `term1` but not `term2`.

Use the full set of document IDs when evaluating `NOT`, so a query such as `NOT ranking` can return every document that does not contain `ranking`.

For the initial version, support simple two-term expressions. If time permits, add parenthesized expressions and operator precedence in a later phase.

### Vector Space Model

Implement:

- Term frequency (TF).
- Inverse document frequency (IDF).
- TF-IDF weights.
- Document vectors.
- Query vectors.
- Cosine similarity.

Recommended formulas:

```text
TF(term, document) = count(term in document)
```

Use normalized TF if desired:

```text
TF(term, document) = count(term in document) / total_tokens_in_document
```

```text
IDF(term) = log(N / DF(term))
```

where:

- `N` is the total number of documents.
- `DF(term)` is the number of documents containing the term.

To avoid division or logarithm edge cases, an acceptable smoothed version is:

```text
IDF(term) = log((N + 1) / (DF(term) + 1)) + 1
```

```text
TF-IDF(term, document) = TF(term, document) * IDF(term)
```

Cosine similarity:

```text
cosine(A, B) = dot(A, B) / (||A|| * ||B||)
```

Return `0.0` when either vector has zero length.

### Ranked Output

- Calculate a score for every document relevant to the vector query.
- Sort by score descending.
- Use document ID as a secondary ascending sort key for deterministic output.
- Print the document ID, score, and document text or a short preview.
- Format scores consistently, for example with four decimal places.

## 5. Phase-by-Phase Implementation Plan

## Phase 1: Project Setup and Dataset

### Tasks

1. Create the project folders and files.
2. Add at least 20 short documents.
3. Give every document a stable ID.
4. Decide whether documents are loaded from `.txt` files or defined in code.
5. Add a loader that returns a mapping such as:

   ```typescript
   {
     id: "D01",
     content: "Search engines use inverted indexes...",
   }
   ```

### Verification

- Confirm at least 20 documents are loaded.
- Confirm every ID is unique.
- Confirm no document is empty.
- Print the number of loaded documents before continuing.

### Deliverable

A reproducible dataset and a document-loading function.

## Phase 2: Tokenization and Text Preprocessing

### Tasks

1. Write one reusable `tokenize(text)` function.
2. Convert input to lowercase.
3. Extract word tokens with a consistent rule, such as a regular expression.
4. Apply the same tokenizer to document text and query text.
5. Add optional stop-word removal only if it is clearly documented.

### Verification

Test examples such as:

- `"Ranking, Indexing!"` becomes `["ranking", "indexing"]`.
- Uppercase and lowercase forms produce the same token.
- Punctuation does not create unwanted tokens.
- An empty string returns an empty list.

### Deliverable

A tested preprocessing function that all later components reuse.

## Phase 3: Inverted Index Construction

### Tasks

1. Tokenize every document.
2. Create an empty dictionary for the inverted index.
3. For each unique token in a document, add that document ID to the token's postings set.
4. Store document frequency information, either from the index or in a separate mapping.
5. Keep the complete set of document IDs for `NOT` queries.

### Verification

Check that:

- Common terms map to multiple document IDs.
- A term appearing once maps to exactly one ID.
- An unknown term returns an empty set.
- A document ID is not duplicated in one postings list.
- The index contains all expected vocabulary terms.

### Deliverable

An `build_inverted_index(documents)` function and a usable inverted index.

## Phase 4: Boolean Query Processing

### Tasks

1. Implement a helper that looks up a term and returns an empty set when it is unknown.
2. Implement `AND` using set intersection.
3. Implement `OR` using set union.
4. Implement binary `NOT` as left-hand postings minus right-hand postings.
5. Optionally support unary `NOT` by subtracting a term's postings from all document IDs.
6. Normalize query terms before lookup.
7. Reject malformed queries with a clear error message rather than silently returning incorrect results.

### Initial Query Examples

```text
indexing AND ranking
indexing OR retrieval
ranking NOT multimedia
NOT ranking
```

### Verification

Manually and programmatically verify:

- `A AND B` returns only documents containing both terms.
- `A OR B` returns documents containing either term.
- `A NOT B` excludes every document containing `B`.
- Unknown terms behave predictably.
- Results are sorted by document ID before display.

### Deliverable

A Boolean query function, for example:

```typescript
booleanSearch(query, invertedIndex, allDocumentIds)
```

## Phase 5: TF-IDF Calculation

### Tasks

1. Store token lists or term-frequency counters for each document.
2. Implement term frequency.
3. Calculate document frequency from the inverted index.
4. Calculate smoothed or unsmoothed IDF consistently.
5. Implement a function that produces a TF-IDF vector for a document over a supplied vocabulary.
6. Implement the same vectorization process for a query.

### Design Decision

Use a shared vocabulary for each comparison. The simplest option is the union of query terms and all document terms. A more efficient option is to use only query terms for scoring because terms absent from the query contribute zero to the dot product.

### Verification

Check that:

- A term's document frequency is correct.
- The IDF of a common term is lower than that of a rare term.
- Repeated terms increase TF.
- Unknown query terms do not crash the calculation.
- Vectors have matching dimensions before cosine similarity is calculated.

### Deliverable

TF, IDF, and TF-IDF helper functions with small numerical tests.

## Phase 6: Cosine Similarity and Vector Search

### Tasks

1. Implement dot product.
2. Implement vector magnitude.
3. Implement cosine similarity with a zero-vector guard.
4. Vectorize the query.
5. Vectorize every document using the same term ordering.
6. Calculate one score per document.
7. Sort scores from highest to lowest.
8. Use document ID as a deterministic tie-breaker.

### Verification

Test that:

- Identical non-empty vectors have similarity `1.0`.
- Orthogonal vectors have similarity `0.0`.
- A zero vector returns `0.0` instead of raising an error.
- A query containing a document's distinctive terms ranks that document highly.
- Results are sorted in descending score order.

### Deliverable

A vector search function, for example:

```typescript
vectorSearch(query, documents, tokenizedDocuments, invertedIndex)
```

## Phase 7: TypeScript Command-Line Interface and Result Display

### Tasks

1. Add a TypeScript command-line entry point.
2. Load the dataset and build indexes at startup.
3. Let the user choose Boolean or vector search.
4. Read a query from standard input.
5. Display Boolean document matches.
6. Display vector results with scores.
7. Add educational inspection commands for the inverted index and document TF-IDF weights.
8. Provide a quit option.
9. Handle blank input and invalid operators clearly.

### Suggested Interaction

```text
Choose mode:
1. Boolean search
2. Ranked vector search
3. Show inverted index
4. Show document TF-IDF weights
q. Quit

Enter query:
```

### Verification

Run at least these demonstrations:

1. Boolean `indexing AND ranking`.
2. Boolean `retrieval OR search`.
3. Boolean `ranking NOT multimedia`.
4. Vector query `search engine ranking`.
5. A query containing an unknown word.
6. A blank or malformed query.

### Deliverable

A complete runnable TypeScript CLI demonstration with readable output.

## Phase 8: Testing, Documentation, and Final Review

### Tasks

1. Add unit tests for loading, tokenization, indexing, Boolean operations, TF-IDF, cosine similarity, and sorting.
2. Add integration tests that run realistic searches across the 20-document dataset.
3. Document the formulas and assumptions in the source code or README.
4. Confirm that all code paths use the shared tokenizer.
5. Confirm that result ordering is deterministic.
6. Check for division-by-zero and unknown-term handling.
7. Run the program from a clean terminal using the documented command.

### Recommended TypeScript Tooling

- Use Bun and TypeScript.
- Use `bun run` to execute TypeScript during development.
- Use Bun's built-in test runner for automated tests.
- Use filesystem APIs to load the `.txt` files.
- Keep runtime dependencies minimal.

Suggested scripts:

```json
{
  "scripts": {
    "dev": "bun run src/cli.ts",
    "test": "bun test",
    "typecheck": "bunx tsc --noEmit"
  }
}
```

## Phase 9: Optional Frontend and API Extension

This phase is not required for the assignment. Start it only after the CLI and automated tests are complete, or if the course rubric explicitly requires a graphical interface.

### Tasks

1. Add an HTTP API using Express, Fastify, or the Node.js HTTP module.
2. Expose separate endpoints for Boolean and ranked vector searches.
3. Reuse the existing search-engine functions rather than duplicating search logic.
4. Add a small frontend with a query input, search-mode selector, and results display.
5. Show document IDs, document previews, and cosine scores.
6. Add browser-level validation only if the frontend is implemented.

### Optional Deliverable

A web interface that calls the same TypeScript search engine used by the CLI. The frontend must remain an extension, not a replacement for the tested core modules.

## 10. Final Acceptance Checklist

- [ ] At least 20 documents are present and loaded.
- [ ] Documents have unique stable IDs.
- [ ] Tokenization is implemented and reused consistently.
- [ ] The inverted index maps every term to document IDs.
- [ ] `AND` uses intersection.
- [ ] `OR` uses union.
- [ ] `NOT` uses set difference.
- [ ] Unknown terms are handled safely.
- [ ] TF and IDF are calculated correctly.
- [ ] Documents and queries use compatible vectors.
- [ ] Cosine similarity handles zero vectors.
- [ ] Ranked results are sorted from highest to lowest score.
- [ ] Scores are displayed clearly.
- [ ] The CLI can display the inverted index for learning and debugging.
- [ ] The CLI can display non-zero TF-IDF weights for a selected document.
- [ ] Automated tests pass.
- [ ] The command-line demonstration works from a clean start.
- [ ] Code is organized into focused TypeScript modules.
- [ ] Names are descriptive and explicit types are used.
- [ ] Comments explain algorithms, formulas, and non-obvious decisions without narrating obvious code.
- [ ] Exported functions have useful documentation where needed.
- [ ] A README or usage section explains setup, commands, examples, assumptions, and limitations.

## 11. Recommended Implementation Order

Complete the phases in this order:

1. Dataset and loader.
2. Tokenizer.
3. Inverted index.
4. Boolean search.
5. Term-frequency and IDF calculations.
6. Vectorization and cosine similarity.
7. Ranked output.
8. TypeScript command-line interface.
9. Tests and documentation.
10. Optional API and frontend.

Do not begin ranking until tokenization and indexing are stable. The Boolean and vector models should share the same normalized terms so their results can be compared fairly.

## 12. Optional Extensions After the Core Version

Only add these after all acceptance criteria pass:

- Parentheses and Boolean operator precedence.
- Phrase queries such as `"inverted index"`.
- Relevance feedback.
- Search-result snippets with matched terms highlighted.
- File metadata such as title and category.
- A web interface and API, only if required or desired after the CLI version is complete.
- Persisting the index to JSON.
- Comparing Boolean-filtered documents against all vector-ranked documents.
- Replacing file storage with SQLite or PostgreSQL.
- Running a database through Docker Compose.
