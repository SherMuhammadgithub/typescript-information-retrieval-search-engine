# TypeScript Information Retrieval Search Engine

A small educational information-retrieval system implemented in TypeScript and run with Bun.

The project demonstrates two classic search models:

- **Boolean Model:** Uses an inverted index and set operations to return strict matching documents.
- **Vector Space Model:** Uses TF-IDF and cosine similarity to rank documents by relevance.

The dataset contains 20 plain-text documents in the `data/` folder. Documents are loaded at startup, tokenized, and indexed in memory. No database or Docker setup is required.

## Features

- Loads at least 20 searchable text documents.
- Normalizes text into lowercase word and number tokens.
- Builds an inverted index:

  ```text
  term -> document IDs
  ```

- Supports Boolean queries using:
  - `AND` for set intersection
  - `OR` for set union
  - binary `NOT` for set difference
  - unary `NOT` for all documents except those containing a term
- Calculates normalized term frequency.
- Calculates smoothed inverse document frequency.
- Creates TF-IDF vectors with one shared vocabulary.
- Calculates cosine similarity between queries and documents.
- Displays ranked vector-search results.
- Includes educational commands for inspecting the inverted index and TF-IDF weights.
- Includes unit tests and phase verification scripts.

## Requirements

- [Bun](https://bun.sh/) 1.0 or newer
- A terminal

The project is designed to use Bun commands. Node.js and npm are not required for normal development.

## Installation

From the project directory, install dependencies with:

```bash
bun install
```

This installs the development type declarations and uses the committed `bun.lock` file for reproducible dependency resolution.

## Run the CLI

Start the interactive search engine:

```bash
bun run dev
```

The menu provides these options:

```text
1. Boolean search
2. Ranked vector search
3. Show inverted index
4. Show document TF-IDF weights
q. Quit
```

## Boolean Search Examples

Choose option `1`, then enter one of the following:

```text
indexing AND ranking
retrieval OR search
ranking NOT multimedia
NOT ranking
```

Boolean search returns document IDs that strictly satisfy the expression. It does not calculate TF-IDF or cosine similarity.

## Ranked Vector Search Examples

Choose option `2`, then enter:

```text
search engine ranking
```

The CLI converts the query and every document into TF-IDF vectors, calculates cosine similarity, and displays matching documents from the highest score to the lowest score.

Example output:

```text
Ranked vector results:
1. DOC02 | Score: 0.3607 | ...
2. DOC13 | Score: 0.2133 | ...
```

Documents with a score of `0` are omitted from the displayed ranked results.

## Inspect the Inverted Index

Choose option `3` to display the dictionary created from the documents:

```text
search -> DOC01, DOC02, DOC12, DOC15, DOC16, DOC18
ranking -> DOC02, DOC13, DOC20
tokenization -> DOC03
```

The index is stored in memory as:

```typescript
Map<string, Set<string>>
```

The `Map` stores each term, and its `Set` stores the document IDs containing that term.

## Inspect TF-IDF Weights

Choose option `4`, then enter a document ID such as:

```text
DOC01
```

The CLI displays the top 10 non-zero TF-IDF terms for that document. Enter `all` to inspect every document.

The full vector uses the same vocabulary for every document. The CLI only displays the top non-zero terms to keep the output readable.

## Project Structure

```text
project/
├── data/
│   ├── doc01.txt
│   ├── ...
│   └── doc20.txt
├── src/
│   ├── booleanSearch.ts
│   ├── cli.ts
│   ├── dataLoader.ts
│   ├── invertedIndex.ts
│   ├── tfidf.ts
│   ├── tokenizer.ts
│   ├── types.ts
│   ├── vectorSearch.ts
│   └── verification/
│       ├── verify-boolean-search.ts
│       ├── verify-document-loading.ts
│       ├── verify-inverted-index.ts
│       ├── verify-tfidf.ts
│       ├── verify-tokenization.ts
│       └── verify-vector-search.ts
├── tests/
├── .gitignore
├── bun.lock
├── package.json
├── PLAN.md
├── README.md
└── tsconfig.json
```

## Development Commands

### Run tests

```bash
bun test
```

### Run strict TypeScript checking

```bash
bun run typecheck
```

### Run phase verification scripts

```bash
bun run verify:documents
bun run verify:tokenization
bun run verify:inverted-index
bun run verify:boolean-search
bun run verify:tfidf
bun run verify:vector-search
```

These scripts verify the dataset loader, preprocessing, inverted index, Boolean operations, TF-IDF calculations, and vector ranking independently.

## Adding or Editing Documents

Edit or add files in [data/](./data/). The loader accepts files matching this pattern:

```text
doc<number>.txt
```

For example:

```text
data/doc21.txt
```

After changing the content, restart the CLI or rerun the verification commands. The inverted index and TF-IDF statistics are rebuilt from the latest files at startup.

Each document should:

- Have a unique filename and ID.
- Contain non-empty plain text.
- Use content from the chosen domain.
- Include enough text for meaningful term-frequency differences.

## Implementation Notes

### Tokenization

Text is converted to lowercase and tokenized with letters and numbers. Punctuation is ignored, and stop words are currently retained.

### Inverted Index

The inverted index answers:

```text
Which documents contain this term?
```

### TF-IDF

The project uses normalized term frequency and smoothed IDF:

```text
TF = term count / total document tokens
IDF = log((N + 1) / (DF + 1)) + 1
TF-IDF = TF * IDF
```

### Cosine Similarity

Cosine similarity compares the query vector with each document vector:

```text
cosine(A, B) = dot(A, B) / (magnitude(A) * magnitude(B))
```

Zero vectors receive a similarity score of `0`.

## Current Limitations

- Boolean expressions currently support simple two-term forms.
- Parentheses and complex operator precedence are not implemented.
- The index is rebuilt in memory whenever the application starts.
- The project does not use a database.
- The required interface is a CLI; a frontend/API would be an optional extension.

See [PLAN.md](./PLAN.md) for the complete phase-by-phase implementation plan.
