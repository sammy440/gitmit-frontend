"use client";

import { analyze, buildPatch, createProvider, generate, planSplit, type Analysis } from "@gitmit/core";
import { AnimatePresence, motion, stagger } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnalysisFlow } from "./AnalysisFlow";
import { RunFlow, type FlowStep } from "./RunFlow";
import { EXAMPLES } from "@/content/examples";
import { API_URL } from "@/lib/site";
import { CopyButton } from "./CopyButton";
import { DiffView } from "./DiffView";

type Mode = "offline" | "key";
type Task = "messages" | "split";
type AiProvider = "openai" | "anthropic";

interface Suggestion {
  message: string;
}
interface Commit {
  units: number[];
  reason: string;
  message: string;
}
interface SplitResult {
  source: "model" | "rules";
  note?: string;
  commits: Commit[];
  units: { id: number; path: string }[];
}
interface Finding {
  rule: string;
  path?: string;
  preview: string;
}
type Result =
  | { task: "messages"; suggestions: Suggestion[]; redacted: boolean }
  | { task: "split"; split: SplitResult; redacted: boolean };

class DemoError extends Error {
  constructor(
    message: string,
    readonly findings?: Finding[],
  ) {
    super(message);
  }
}

export function Demo() {
  const [diff, setDiff] = useState(EXAMPLES[0]!.diff);
  const [exampleId, setExampleId] = useState(EXAMPLES[0]!.id);
  const [mode, setMode] = useState<Mode>("offline");
  const [task, setTask] = useState<Task>("messages");
  const [provider, setProvider] = useState<AiProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [redact, setRedact] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<DemoError | null>(null);
  const [busy, setBusy] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [flow, setFlow] = useState<Flow | null>(null);

  // Rules-only analysis runs locally and never leaves the page. It re-runs shortly after typing
  // stops, so the flow animation doesn't restart on every keystroke.
  // The first run happens right after load (not during render, so server and browser agree).
  const [live, setLive] = useState<LiveAnalysis | null>(null);
  const firstRun = useRef(true);
  useEffect(() => {
    const timer = setTimeout(() => setLive(analyzeTimed(diff)), firstRun.current ? 0 : 300);
    firstRun.current = false;
    return () => clearTimeout(timer);
  }, [diff]);
  const analysis = live?.analysis ?? null;

  function loadExample(id: string) {
    const example = EXAMPLES.find((e) => e.id === id);
    if (!example) return;
    setExampleId(id);
    setDiff(example.diff);
    setResult(null);
    setError(null);
    if (id === "messy") setTask("split");
  }

  async function run() {
    setError(null);
    setResult(null);
    setFlow(null);
    if (!analysis) {
      setError(new DemoError("Paste a diff first. Run `git diff --staged` in your repository and paste the output."));
      return;
    }
    if (mode === "key" && !apiKey.trim()) {
      setError(new DemoError(`Enter your ${provider === "openai" ? "OpenAI" : "Anthropic"} API key, or switch to Offline.`));
      return;
    }

    const labels = STEP_LABELS[mode][task];
    setFlow({ steps: labels.map((label, i) => ({ label, state: i === 0 ? "active" : "pending" })), startedAt: now() });
    const mark = (index: number, state: FlowStep["state"]) =>
      setFlow((f) => f && { ...f, steps: f.steps.map((s, i) => (i === index ? { ...s, state } : s)) });
    const advance = (index: number) => {
      mark(index, "done");
      if (index + 1 < labels.length) mark(index + 1, "active");
    };

    setBusy(true);
    try {
      let next: Result;
      if (mode === "offline") {
        // The work takes milliseconds; pace the steps so the flow is readable.
        const work = runOffline();
        await sleep(280);
        advance(0);
        next = await work;
        await sleep(280);
        advance(1);
      } else {
        const request = runRemote();
        let settled = false;
        request.then(
          () => (settled = true),
          () => (settled = true),
        );
        // The secret scan runs on the server before the provider call; move on once it's had time to.
        await sleep(350);
        if (!settled) advance(0);
        next = await request;
        advance(0);
        advance(1);
      }
      await sleep(220);
      mark(labels.length - 1, "done");
      setFlow((f) => f && { ...f, finishedAt: now() });
      setResult(next);
    } catch (e) {
      const failure = e instanceof DemoError ? e : new DemoError(e instanceof Error ? e.message : "Something went wrong.");
      // A secret stops the run at the scan, before anything reaches the AI.
      setFlow(
        (f) =>
          f && {
            ...f,
            finishedAt: now(),
            steps: f.steps.map((s, i) =>
              failure.findings?.length
                ? { ...s, state: i === 0 ? "error" : "pending" }
                : s.state === "active"
                  ? { ...s, state: "error" }
                  : s,
            ),
          },
      );
      setError(failure);
    } finally {
      setBusy(false);
    }
  }

  async function runOffline(): Promise<Result> {
    const rules = createProvider("rules");
    if (task === "messages") {
      const { suggestions } = await generate(diff, { provider: rules });
      return { task, suggestions, redacted: false };
    }
    const { diff: units, plan } = await planSplit(diff, { provider: rules });
    const commits = await Promise.all(
      plan.groups.map(async (g) => {
        const { suggestions } = await generate(buildPatch(units, g.units), { provider: rules, variants: 1 });
        return { units: g.units, reason: g.reason, message: suggestions[0]!.message };
      }),
    );
    return {
      task,
      redacted: false,
      split: { source: plan.source, commits, units: units.units.map((u) => ({ id: u.id, path: u.path })) },
    };
  }

  async function runRemote(): Promise<Result> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/${task === "messages" ? "generate" : "split"}`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({
          diff,
          provider,
          ...(model.trim() ? { model: model.trim() } : {}),
          secrets: redact ? "redact" : "abort",
        }),
      });
    } catch {
      throw new DemoError("Could not reach the gitmit API. Check your connection, or use Offline mode.");
    }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new DemoError(body?.error?.message ?? `The API returned an error (HTTP ${response.status}).`, body?.error?.details);
    }
    return task === "messages"
      ? { task, suggestions: body.suggestions, redacted: body.redacted }
      : { task, split: body, redacted: false };
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Input */}
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="example" className="text-sm text-muted">
            Example
          </label>
          <select
            id="example"
            value={exampleId}
            onChange={(e) => loadExample(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            {EXAMPLES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowDiff((s) => !s)}
            className="ml-auto text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            {showDiff ? "Edit diff" : "View highlighted"}
          </button>
        </div>

        {showDiff ? (
          <DiffView diff={diff} className="h-[420px]" />
        ) : (
          <textarea
            value={diff}
            onChange={(e) => {
              setDiff(e.target.value);
              setExampleId("");
            }}
            spellCheck={false}
            placeholder="Paste the output of: git diff --staged"
            aria-label="Diff"
            className="h-[420px] w-full resize-y rounded-lg border border-border bg-surface p-3 font-mono text-xs leading-relaxed outline-none focus:border-accent"
          />
        )}
        <p className="text-xs text-muted">
          Tip: <code className="font-mono">git diff --staged | pbcopy</code> on macOS, or{" "}
          <code className="font-mono">git diff --staged | clip</code> on Windows.
        </p>

        {/* Mode */}
        <div className="rounded-lg border border-border p-3">
          <div className="flex gap-1 rounded-md bg-surface p-1 text-sm" role="tablist" aria-label="Mode">
            {(["offline", "key"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded px-3 py-1.5 transition ${mode === m ? "bg-background font-medium shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                {m === "offline" ? "Offline (free)" : "Your API key"}
              </button>
            ))}
          </div>
          {mode === "offline" ? (
            <p className="mt-3 text-sm text-muted">
              Runs entirely in your browser with gitmit&apos;s rules. Nothing is sent anywhere.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AiProvider)}
                aria-label="Provider"
                className="rounded-md border border-border bg-background px-2 py-1.5"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
                autoComplete="off"
                aria-label="API key"
                className="rounded-md border border-border bg-background px-2 py-1.5 font-mono outline-none focus:border-accent"
              />
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider === "openai" ? "Model (default gpt-5-mini)" : "Model (default claude-opus-5-5)"}
                aria-label="Model"
                className="rounded-md border border-border bg-background px-2 py-1.5 font-mono outline-none focus:border-accent sm:col-span-2"
              />
              <label className="flex items-center gap-2 text-muted sm:col-span-2">
                <input type="checkbox" checked={redact} onChange={(e) => setRedact(e.target.checked)} />
                If a secret is found, send a redacted version instead of stopping
              </label>
              <p className="text-xs text-muted sm:col-span-2">
                Your key is kept in this page&apos;s memory only, sent with your request, and never stored or logged. The diff is
                scanned for secrets before it reaches the AI.{" "}
                <Link href="/docs/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy details
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-md bg-surface p-1 text-sm" role="tablist" aria-label="Task">
            {(["messages", "split"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={task === t}
                onClick={() => setTask(t)}
                className={`rounded px-3 py-1.5 transition ${task === t ? "bg-background font-medium shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                {t === "messages" ? "Suggest messages" : "Split into commits"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="ml-auto rounded-md bg-accent px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Working..." : task === "messages" ? "Generate" : "Plan commits"}
          </button>
        </div>
      </section>

      {/* Output */}
      <section className="flex min-w-0 flex-col gap-4" aria-live="polite">
        {live ? <AnalysisFlow key={live.runId} analysis={live.analysis} runId={live.runId} durationMs={live.durationMs} /> : <Empty />}
        <AnimatePresence mode="popLayout">
          {flow && <RunFlow key={flow.startedAt} steps={flow.steps} startedAt={flow.startedAt} finishedAt={flow.finishedAt} />}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {error && <ErrorPanel key={error.message} error={error} />}
          {result?.task === "messages" && <Suggestions key="messages" suggestions={result.suggestions} redacted={result.redacted} />}
          {result?.task === "split" && <SplitPlanView key="split" split={result.split} />}
        </AnimatePresence>
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-full min-h-48 place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
      Paste a diff or pick an example to see how gitmit reads it.
    </div>
  );
}

const list = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.09) } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
const card = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 320, damping: 28 } },
};

function Suggestions({ suggestions, redacted }: { suggestions: Suggestion[]; redacted: boolean }) {
  return (
    <motion.div className="flex flex-col gap-3" variants={list} initial="hidden" animate="show" exit="exit">
      {redacted && <p className="text-sm text-muted">Secrets were redacted before the diff was sent.</p>}
      {suggestions.map((s, i) => {
        const [header, ...rest] = s.message.split("\n");
        const body = rest.join("\n").trim();
        return (
          <motion.article
            key={i}
            variants={card}
            className="rounded-lg border border-border p-4 transition-colors hover:border-accent/60"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-xs text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-mono text-sm font-semibold">{header}</p>
                {body && <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-muted">{body}</pre>}
              </div>
              <CopyButton text={s.message} />
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}

function SplitPlanView({ split }: { split: SplitResult }) {
  const pathOf = new Map(split.units.map((u) => [u.id, u.path]));
  return (
    <motion.div className="flex flex-col gap-3" variants={list} initial="hidden" animate="show" exit="exit">
      <p className="text-sm text-muted">
        {split.commits.length < 2
          ? "These changes already form one focused commit."
          : `${split.commits.length} focused commits, grouped ${split.source === "model" ? "by the AI" : "by area and kind of change"}.`}
        {split.note ? ` ${split.note}.` : ""}
      </p>
      {split.commits.map((c, i) => {
        const files = [...new Set(c.units.map((u) => pathOf.get(u)).filter(Boolean))];
        return (
          <motion.article
            key={i}
            variants={card}
            className="rounded-lg border border-border p-4 transition-colors hover:border-accent/60"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-xs text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-mono text-sm font-semibold">{c.message.split("\n")[0]}</p>
                <ul className="mt-2 space-y-0.5">
                  {files.map((f) => (
                    <li key={f} className="truncate font-mono text-xs text-muted">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <CopyButton text={c.message} />
            </div>
          </motion.article>
        );
      })}
      {split.commits.length > 1 && (
        <p className="text-xs text-muted">
          In your terminal, <code className="font-mono">gitmit split</code> creates these commits for you, only touching the
          staging area, and restores everything if anything fails.
        </p>
      )}
    </motion.div>
  );
}

function ErrorPanel({ error }: { error: DemoError }) {
  return (
    <motion.div
      className="rounded-lg border border-del-text/40 bg-del p-4 text-sm text-del-text"
      role="alert"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p>{error.message}</p>
      {error.findings?.length ? (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 font-mono text-xs">
          {error.findings.map((f, i) => (
            <li key={i}>
              {f.rule}
              {f.path ? ` in ${f.path}` : ""}: {f.preview}
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  );
}

interface Flow {
  steps: FlowStep[];
  startedAt: number;
  finishedAt?: number;
}

/** What each run does, step by step. Offline runs never leave the browser, so they have no secret scan. */
const STEP_LABELS: Record<Mode, Record<Task, string[]>> = {
  offline: { messages: ["Summarize", "Write", "Validate"], split: ["Find hunks", "Group", "Write messages"] },
  key: { messages: ["Secret scan", "AI provider", "Validate"], split: ["Secret scan", "AI planner", "Write messages"] },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => performance.now();

interface LiveAnalysis {
  analysis: Analysis;
  durationMs: number;
  runId: number;
}

function analyzeTimed(diff: string): LiveAnalysis | null {
  if (!diff.trim()) return null;
  try {
    const started = now();
    const analysis = analyze(diff);
    const durationMs = now() - started;
    return analysis.files.length ? { analysis, durationMs, runId: hash(diff) } : null;
  } catch {
    return null;
  }
}

/** A cheap string hash, to restart the analysis animation when the diff changes. */
function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return h;
}
