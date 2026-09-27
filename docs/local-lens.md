# Local Lens

## Question
Can a small document-search tool make every result inspectable without sending user text to an API?

## Implementation
Normalize Unicode with NFKC, lowercase terms, remove common English stopwords, and chunk into four original lines. Keep source document id, title and start/end lines on every passage. An in-memory index stores document frequencies and average passage length. BM25 with k1=1.2 and b=0.75 ranks passages; repeated query terms are deduplicated. Stable ids break score ties. No positive match means no result.

The UI accepts .txt and .md, limits files to 500 KB and the library to 12 documents, and holds uploaded text only in the current tab's React state. Reload resets it. The search and upload handlers make no network requests. Hosting itself still serves static assets; this is not a claim that the browser is offline.

## Why BM25
A small collection benefits from a deterministic algorithm whose ranking can be tested without a model download, API bill or hidden generation step. Result scores are ranking values, not probabilities. Questions work when their words overlap source passages; synonyms and reasoning may fail.

## Evidence
Tests check ranking on explicit matching terms, line provenance, Unicode, CRLF normalization, stable ties, duplicate ids, empty/stopword-only queries and no-match abstention. These are algorithm checks, not a broad retrieval-quality benchmark.

## Boundaries
No LLM or embedding model. No fabricated answer. No persistent storage. No PDF parser. Uploaded Markdown is displayed as plain text through React escaping. Four-line chunks can split a relevant explanation. Large documents and English stopwords limit use; independent relevance labels and worker-based indexing are useful next steps.
