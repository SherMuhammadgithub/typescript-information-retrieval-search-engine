import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { Document } from "./types";

const DOCUMENT_FILE_PATTERN = /^doc\d+\.txt$/i;

/**
 * Loads all valid text documents from a directory.
 *
 * IDs are derived from filenames, so `doc01.txt` becomes `D01`.
 * The loader validates the collection early to prevent duplicate or empty
 * documents from entering the indexing pipeline.
 */
export async function loadDocuments(
  dataDirectory: string,
): Promise<Document[]> {
  const fileNames = (await readdir(dataDirectory))
    .filter((fileName) => DOCUMENT_FILE_PATTERN.test(fileName))
    .sort((first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
    );

  const documents = await Promise.all(
    fileNames.map(async (fileName): Promise<Document> => {
      const filePath = join(dataDirectory, fileName);
      const content = (await readFile(filePath, "utf8")).trim();
      const fileStem = basename(fileName, extname(fileName));
      const id = fileStem.toUpperCase();

      if (content.length === 0) {
        throw new Error(`Document ${id} is empty: ${filePath}`);
      }

      return { id, content };
    }),
  );

  validateDocuments(documents);
  return documents;
}

/**
 * Ensures the loaded collection has stable, unique IDs and non-empty content.
 */
export function validateDocuments(documents: Document[]): void {
  const ids = new Set<string>();

  for (const document of documents) {
    if (ids.has(document.id)) {
      throw new Error(`Duplicate document ID found: ${document.id}`);
    }

    if (document.content.trim().length === 0) {
      throw new Error(`Document ${document.id} has no content`);
    }

    ids.add(document.id);
  }
}
