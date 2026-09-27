/** Local Lens: immutable BM25 index with source-line citations; no network or model calls. */
export type Document = { id: string; title: string; text: string };
export type Passage = {
  id: string;
  documentId: string;
  title: string;
  text: string;
  startLine: number;
  endLine: number;
  tokens: string[];
};
export type SearchHit = Passage & { score: number; matched: string[] };
export const stopWords = new Set(
  "a an and are as at be by do does for from how i in is it me my of on or our that the their them they this to was we what when where which who why will with you your".split(
    " ",
  ),
);
export function tokenize(text: string): string[] {
  return (
    text
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).filter((t) => !stopWords.has(t));
}
export function chunkDocument(doc: Document, linesPerChunk = 4): Passage[] {
  if (!Number.isInteger(linesPerChunk) || linesPerChunk < 1)
    throw new Error("Chunk size must be positive");
  const lines = doc.text.replace(/\r\n?/g, "\n").split("\n");
  const chunks: Passage[] = [];
  for (let i = 0; i < lines.length; i += linesPerChunk) {
    const text = lines
      .slice(i, i + linesPerChunk)
      .join("\n")
      .trim();
    const tokens = tokenize(text);
    if (tokens.length)
      chunks.push({
        id: `${doc.id}:${i + 1}`,
        documentId: doc.id,
        title: doc.title,
        text,
        startLine: i + 1,
        endLine: Math.min(i + linesPerChunk, lines.length),
        tokens,
      });
  }
  return chunks;
}
export function createIndex(docs: Document[]) {
  if (new Set(docs.map((d) => d.id)).size !== docs.length)
    throw new Error("Document IDs must be unique");
  const passages = docs.flatMap((d) => chunkDocument(d));
  const df = new Map<string, number>();
  for (const p of passages)
    for (const token of new Set(p.tokens)) df.set(token, (df.get(token) ?? 0) + 1);
  return {
    passages,
    df,
    avgLength: passages.reduce((sum, p) => sum + p.tokens.length, 0) / (passages.length || 1),
  };
}
export function search(
  index: ReturnType<typeof createIndex>,
  query: string,
  limit = 3,
): SearchHit[] {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length || limit < 1) return [];
  const n = index.passages.length;
  return index.passages
    .map((p) => {
      let score = 0;
      const matched: string[] = [];
      const counts = new Map<string, number>();
      for (const t of p.tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
      for (const t of terms) {
        const tf = counts.get(t) ?? 0;
        if (!tf) continue;
        matched.push(t);
        const idf = Math.log(
          1 + (n - (index.df.get(t) ?? 0) + 0.5) / ((index.df.get(t) ?? 0) + 0.5),
        );
        score +=
          (idf * (tf * 2.2)) / (tf + 1.2 * (0.25 + (0.75 * p.tokens.length) / index.avgLength));
      }
      return { ...p, score, matched };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}
