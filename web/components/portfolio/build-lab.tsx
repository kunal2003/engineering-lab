"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Plus, RotateCcw, Search, Play } from "lucide-react";
import { pack, unpack, infer, evaluate, type Bits, type Model } from "@/lib/lab/precision";
import { createIndex, search, type Document } from "@/lib/lab/retrieval";
import { project, nextScan, stations, type Scan } from "@/lib/lab/signal";
import modelData from "@/data/lab/model.json";
import points from "@/data/lab/test-points.json";
const source = "https://github.com/kunal2003/engineering-lab";
const model = modelData as Model;
const starter: Document[] = [
  {
    id: "precision",
    title: "Precision Lab · experiment notes",
    text: "Precision Lab trains a small neural network to classify concentric rings.\nThe architecture is 2 → 16 → 16 → 2, with ReLU hidden layers.\nTraining uses 1,536 synthetic points and a separate 512-point test set.\nWeights are stored as float32, signed int8, or packed signed int4.\nEach layer has a symmetric scale; biases remain float32.\nThe decoder restores weights before JavaScript inference.\nPacked model sizes include headers, scales, shapes and biases.\nThis is a storage experiment, not a GPU kernel or language model.",
  },
  {
    id: "signal",
    title: "Signal · system decisions",
    text: "Signal models the handoffs in an RFID baggage journey.\nCheck-in, sorting, security, loading and arrival produce scan events.\nEach event has an id, bag identifier, station and timestamp.\nRepeated event ids are deduplicated during projection.\nA later scan can reveal a missing earlier station.\nLate scans close gaps without moving the bag backwards.\nThe event log can be replayed to derive the same state.\nThis browser simulator does not connect to physical RFID hardware.",
  },
  {
    id: "lens",
    title: "Local Lens · retrieval decisions",
    text: "Local Lens searches documents entirely inside your browser.\nText is normalized and split into four-line passages.\nBM25 ranks passages using term frequency and inverse document frequency.\nResults retain document titles and original line numbers.\nQueries with no matching terms return no results.\nUploaded text files stay in browser memory and are not sent to a server.\nThere is no embedding model, language model or generated answer.\nReloading clears uploaded documents.",
  },
];
function SourceLink({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <a
      className="experiment-link"
      href={`${source}/tree/main/${path}`}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
export function BuildLab() {
  return (
    <div id="lab">
      <div className="lab-opening wrap">
        <p className="section-label">01 / THE PLAYGROUND</p>
        <p>
          Don’t just read about it.
          <br />
          <em>Put it through its paces.</em>
        </p>
        <span className="mono">
          THREE WORKING PROTOTYPES
          <br />
          BUILT SEPTEMBER 2026 · WITH CODEX ASSISTANCE
        </span>
      </div>
      <Precision />
      <Lens />
      <Signal />
    </div>
  );
}
function Precision() {
  const [bits, setBits] = useState<Bits>(8);
  const [latency, setLatency] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [probe, setProbe] = useState<{ x: number; y: number; prob: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bytes = useMemo(() => pack(model, bits), [bits]);
  const selected = useMemo(() => unpack(bytes), [bytes]);
  const accuracy = useMemo(() => evaluate(selected, points), [selected]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const size = 480;
    ctx.clearRect(0, 0, size, size);
    const step = 4;
    for (let y = 0; y < size; y += step)
      for (let x = 0; x < size; x += step) {
        const a = infer(selected, [(x / size - 0.5) * 6, (0.5 - y / size) * 6])[1];
        ctx.fillStyle =
          a > 0.5
            ? `rgba(97,150,187,${0.12 + a * 0.12})`
            : `rgba(239,112,76,${0.22 + (1 - a) * 0.13})`;
        ctx.fillRect(x, y, step, step);
      }
    ctx.strokeStyle = "#62645d";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 80, 0);
      ctx.lineTo(i * 80, 480);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 80);
      ctx.lineTo(480, i * 80);
      ctx.stroke();
    }
    for (const p of points.slice(0, 180)) {
      ctx.beginPath();
      ctx.arc((p.x / 6 + 0.5) * size, (0.5 - p.y / 6) * size, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = p.label ? "#82b1d2" : "#f88b67";
      ctx.fill();
    }
    if (probe) {
      const x = (probe.x / 6 + 0.5) * size,
        y = (0.5 - probe.y / 6) * size;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x + 14, y);
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y + 14);
      ctx.stroke();
    }
  }, [selected, probe]);
  async function benchmark() {
    setRunning(true);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    for (let j = 0; j < 100; j++) infer(selected, [0.2, 0.5]);
    const trials = [];
    for (let t = 0; t < 9; t++) {
      const start = performance.now();
      for (let r = 0; r < 20; r++) for (const p of points) infer(selected, [p.x, p.y]);
      trials.push((performance.now() - start) / 20);
    }
    trials.sort((a, b) => a - b);
    setLatency(trials[4]);
    setRunning(false);
  }
  return (
    <section className="experiment precision" id="precision">
      <div className="wrap">
        <div className="experiment-heading">
          <h2>
            Less memory.
            <br />
            <em>Same question.</em>
          </h2>
          <div>
            <p className="mono">01 / PRECISION LAB</p>
            <p>
              A tiny neural network. Three ways to store it. Turn the dial and see what survives.
            </p>
            <span className="experiment-tag">TRAINED MODEL · LIVE INFERENCE</span>
          </div>
        </div>
        <div className="precision-grid">
          <div className="plot-frame">
            <div className="panel-caption mono">
              <span>DECISION BOUNDARY</span>
              <span>2 → 16 → 16 → 2</span>
            </div>
            <canvas
              ref={canvas}
              width={480}
              height={480}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProbe({ x: 0, y: 0, prob: infer(selected, [0, 0])[1] });
                }
              }}
              aria-label="Neural network decision boundary. Click to classify a point, or press Enter to classify the origin."
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 6,
                  y = (0.5 - (e.clientY - r.top) / r.height) * 6;
                setProbe({ x, y, prob: infer(selected, [x, y])[1] });
              }}
            />
            <div className="plot-key mono">
              <span>
                <i />
                INNER RING
              </span>
              <span>
                <i />
                OUTER RING
              </span>
              <span>CLICK TO PROBE ↗</span>
            </div>
          </div>
          <div className="precision-controls">
            <p className="mono control-label">WEIGHT PRECISION</p>
            <div className="precision-tabs" role="group" aria-label="Weight precision">
              {([32, 8, 4] as Bits[]).map((b) => (
                <button
                  aria-pressed={b === bits}
                  key={b}
                  onClick={() => {
                    setBits(b);
                    setLatency(null);
                    setProbe(null);
                  }}
                >
                  {b}-bit
                </button>
              ))}
            </div>
            <div className="precision-number">
              <strong>{bits}</strong>
              <span>
                bits per
                <br />
                weight
              </span>
            </div>
            <div className="metric-row">
              <span>Test accuracy</span>
              <strong>{(accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="metric-row">
              <span>Packed model</span>
              <strong>{bytes.length.toLocaleString()} B</strong>
            </div>
            <div className="metric-row">
              <span>512 predictions / your device</span>
              <strong>{latency === null ? "—" : `${latency.toFixed(2)} ms`}</strong>
            </div>
            <p className="probe-result" aria-live="polite">
              {probe
                ? `(${probe.x.toFixed(2)}, ${probe.y.toFixed(2)}) → ${probe.prob > 0.5 ? "outer" : "inner"} ring · ${(100 * Math.max(probe.prob, 1 - probe.prob)).toFixed(1)}% model probability`
                : "Click anywhere on the plot to ask the model."}
            </p>
            <button className="lab-action" disabled={running} onClick={benchmark}>
              {running ? "Measuring…" : "Run on my device"}
              <Play size={16} />
            </button>
            <SourceLink path="docs/precision.md">Open the experiment</SourceLink>
          </div>
        </div>
        <div className="experiment-foot mono">
          <p>354 parameters · 512 held-out synthetic points · deterministic seed 42</p>
          <p>
            Weights are unpacked for JS arithmetic. Smaller storage does not imply faster inference.
          </p>
        </div>
      </div>
    </section>
  );
}
function Lens() {
  const [docs, setDocs] = useState(starter);
  const [query, setQuery] = useState("How are missing scans recovered?");
  const [submitted, setSubmitted] = useState(query);
  const [error, setError] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const index = useMemo(() => createIndex(docs), [docs]);
  const results = useMemo(() => search(index, submitted, 3), [index, submitted]);
  return (
    <section className="experiment lens" id="local-lens">
      <div className="wrap">
        <div className="experiment-heading">
          <h2>
            Your files.
            <br />
            <em>Your business.</em>
          </h2>
          <div>
            <p className="mono">02 / LOCAL LENS</p>
            <p>
              A small search engine with receipts. Drop in a document. Ask a question. Follow the
              evidence.
            </p>
            <span className="experiment-tag">LOCAL RETRIEVAL · ZERO API CALLS</span>
          </div>
        </div>
        <div className="lens-frame">
          <aside className="document-library">
            <p className="mono">
              YOUR LIBRARY <span>{docs.length.toString().padStart(2, "0")}</span>
            </p>
            <div className="document-list">
              {docs.map((doc, i) => (
                <div key={doc.id}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <p>
                    {doc.title}
                    <small>{doc.text.split("\n").length} lines · text</small>
                  </p>
                </div>
              ))}
            </div>
            <input
              ref={upload}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              multiple
              hidden
              onChange={async (e) => {
                setError("");
                const files = Array.from(e.currentTarget.files ?? []);
                if (files.some((f) => f.size > 500000) || docs.length + files.length > 12) {
                  setError("Use up to 12 text files, under 500 KB each.");
                  return;
                }
                const added = await Promise.all(
                  files.map(async (f, i) => ({
                    id: `upload-${Date.now()}-${i}`,
                    title: f.name,
                    text: await f.text(),
                  })),
                );
                setDocs((d) => [...d, ...added]);
                if (upload.current) upload.current.value = "";
              }}
            />
            <button className="text-button" onClick={() => upload.current?.click()}>
              Add .txt or .md <Plus size={18} />
            </button>
            <button
              className="text-button"
              onClick={() => {
                setDocs(starter);
                setError("");
              }}
            >
              Reset library <RotateCcw size={16} />
            </button>
            <p className="library-note">
              Files stay in this tab’s memory.
              <br />
              Reloading clears your uploads.
            </p>
            {error && <p role="alert">{error}</p>}
          </aside>
          <div className="search-panel">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(query);
              }}
            >
              <label className="mono" htmlFor="lens-query">
                SEARCH YOUR DOCUMENTS
              </label>
              <div className="lens-query">
                <input
                  id="lens-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={300}
                  placeholder="Ask a question or enter a phrase"
                />
                <button aria-label="Search documents">
                  <Search size={24} />
                </button>
              </div>
            </form>
            <div className="suggestions">
              {["packed weights", "missing scans", "browser"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    setSubmitted(q);
                  }}
                >
                  {q}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
            <div className="search-results" aria-live="polite">
              <p className="mono result-label">{results.length} MATCHING PASSAGES · BM25 RANKING</p>
              {results.length ? (
                results.map((hit, i) => (
                  <article key={hit.id}>
                    <span className="hit-number mono">0{i + 1}</span>
                    <div>
                      <h3>{hit.title}</h3>
                      <p>{hit.text}</p>
                      <span className="citation mono">
                        SOURCE · LINES {hit.startLine}–{hit.endLine} · SCORE {hit.score.toFixed(2)}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="no-results">
                  <h3>No evidence found.</h3>
                  <p>
                    Try a term that appears in your documents. This search engine won’t invent an
                    answer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="experiment-foot mono">
          <p>Browser-local indexing · four-line passages · line-level citations</p>
          <SourceLink path="docs/local-lens.md">Read the retrieval design</SourceLink>
        </div>
      </div>
    </section>
  );
}
function Signal() {
  const [events, setEvents] = useState<Scan[]>([]);
  const state = useMemo(() => project(events), [events]);
  const [hint, setHint] = useState("Send the first scan to start the journey.");
  function send(stage: number) {
    setEvents((e) => [...e, nextScan(e, stage)]);
    setHint(`Received ${stations[stage].toLowerCase()} scan.`);
  }
  return (
    <section className="experiment signal" id="signal">
      <div className="wrap">
        <div className="experiment-heading">
          <h2>
            A bag. Five handoffs.
            <br />
            <em>One missing signal.</em>
          </h2>
          <div>
            <p className="mono">03 / SIGNAL</p>
            <p>Happy paths are easy. Skip a scan. Send it twice. Then help the system recover.</p>
            <span className="experiment-tag">EVENT SOURCING · FAILURE PLAYGROUND</span>
          </div>
        </div>
        <div className="journey-header mono">
          <span>BAG KM-042</span>
          <span aria-live="polite">{state.status.toUpperCase()}</span>
        </div>
        <div className="journey" aria-label="Five baggage handoffs">
          {stations.map((s, i) => (
            <div
              className={`station ${state.seen.includes(i) ? "seen" : ""} ${state.missing.includes(i) ? "missing" : ""} ${state.last === i ? "current" : ""}`}
              key={s}
            >
              <div className="station-track">
                <span>
                  {state.last === i
                    ? "↗"
                    : state.seen.includes(i)
                      ? "✓"
                      : state.missing.includes(i)
                        ? "!"
                        : String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{s}</h3>
              <p className="mono">
                {state.missing.includes(i)
                  ? "MISSING SCAN"
                  : state.seen.includes(i)
                    ? "SCAN RECEIVED"
                    : "WAITING"}
              </p>
            </div>
          ))}
        </div>
        <div className="signal-grid">
          <div>
            <p className="mono control-label">BREAK THE HAPPY PATH</p>
            <div className="signal-actions">
              <button disabled={state.last === 4} onClick={() => send(state.last + 1)}>
                Next scan
                <ArrowRight size={18} />
              </button>
              <button
                disabled={state.last >= 3}
                onClick={() => {
                  send(state.last + 2);
                  setHint("A handoff was skipped. The next scan exposes the gap.");
                }}
              >
                Skip a station
                <ArrowUpRight size={18} />
              </button>
              <button
                disabled={!events.length}
                onClick={() => {
                  setEvents((e) => [...e, { ...e[e.length - 1] }]);
                  setHint("Same event ID delivered twice. Projection remains unchanged.");
                }}
              >
                Duplicate last scan
                <Plus size={18} />
              </button>
              <button
                onClick={() => {
                  setEvents([]);
                  setHint("Journey reset. The event log is empty.");
                }}
              >
                Reset journey
                <RotateCcw size={16} />
              </button>
            </div>
            {state.missing.length > 0 && (
              <button
                className="recover-action"
                onClick={() => {
                  send(state.missing[0]);
                  setHint("Late evidence closes the gap. The bag never moves backwards.");
                }}
              >
                Recover {stations[state.missing[0]].toLowerCase()} scan <ArrowRight size={18} />
              </button>
            )}
            <p className="signal-hint" aria-live="polite">
              {hint}
            </p>
          </div>
          <div className="event-panel">
            <div className="mono">
              <span>EVENT LOG</span>
              <span>{state.duplicates} DUPLICATES IGNORED</span>
            </div>
            <div className="event-list" aria-live="polite">
              {state.events.length ? (
                state.events.map((e) => (
                  <p key={e.id}>
                    <time>{`00:${String(Math.floor(e.timestamp / 60000)).padStart(2, "0")}`}</time>
                    <span>{stations[e.station]}</span>
                    <small>{e.id}</small>
                  </p>
                ))
              ) : (
                <p className="empty-log">Awaiting first event. Make something happen.</p>
              )}
            </div>
          </div>
        </div>
        <div className="experiment-foot mono">
          <p>
            A working extension of my academic baggage-system project. Simulated events; no hardware
            connection.
          </p>
          <SourceLink path="docs/signal.md">Read the system decisions</SourceLink>
        </div>
      </div>
    </section>
  );
}
