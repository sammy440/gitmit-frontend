"use client";

import type { Analysis } from "@gitmit/core";
import { AnimatePresence, motion, stagger } from "motion/react";
import { useEffect, useState } from "react";

const STEPS = ["Parse", "Classify", "Detect type", "Infer scope"] as const;
/** Time each step stays "active", so the flow is readable. The real work takes about a millisecond. */
const STEP_MS = 230;

const CATEGORY_STYLE: Record<string, string> = {
  source: "bg-accent-soft text-accent",
  test: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  docs: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  ci: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

/**
 * "What the rules see", animated as a live request flow: each pipeline step
 * lights up in turn, and its result lands when the step completes. Give it a
 * new `key` per analysis so the flow starts over.
 */
export function AnalysisFlow({ analysis, runId, durationMs }: { analysis: Analysis; runId: number; durationMs: number }) {
  // 0 = nothing done yet; n = the first n steps are done.
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setDone(i + 1), STEP_MS * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, []);

  const { type, scope, files } = analysis;
  const noise = files.filter((f) => f.noiseReason).length;
  const stepDetail = [
    `${files.length} file${files.length === 1 ? "" : "s"}`,
    noise ? `${noise} noise` : "no noise",
    type.confidence === "high" ? "decided" : "hint",
    scope.scope ?? "none",
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      {/* A soft sweep while the flow runs. */}
      <AnimatePresence>
        {done < STEPS.length && (
          <motion.div
            key={runId}
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
            initial={{ x: "0%" }}
            animate={{ x: "400%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: (STEP_MS * STEPS.length) / 1000, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">What the rules see</h3>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          live · {durationMs < 1 ? "<1" : durationMs.toFixed(1)} ms<span className="hidden sm:inline"> in your browser</span>
        </span>
      </div>

      {/* Pipeline track */}
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const state = i < done ? "done" : i === done ? "active" : "pending";
          return (
            <li key={step} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-[11px] h-px bg-border">
                  <motion.div
                    className="h-full origin-left bg-accent"
                    initial={false}
                    animate={{ scaleX: i < done ? 1 : 0 }}
                    transition={{ duration: STEP_MS / 1000, ease: "easeOut" }}
                  />
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <StepDot state={state} />
                <span className={`mt-1.5 text-[11px] font-medium transition-colors ${state === "pending" ? "text-muted" : "text-foreground"}`}>
                  {step}
                </span>
                <AnimatePresence mode="wait">
                  {state === "done" && (
                    <motion.span
                      key={stepDetail[i]}
                      className="font-mono text-[10px] text-muted"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {stepDetail[i]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Result: type, then scope */}
      <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2 font-mono text-sm">
        <AnimatePresence mode="popLayout">
          {done >= 3 && (
            <motion.span
              key={`${runId}-type`}
              layout
              className="rounded-md bg-accent-soft px-2 py-0.5 font-semibold text-accent shadow-[0_0_24px_-6px] shadow-accent/50"
              initial={{ opacity: 0, scale: 0.7, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
            >
              {type.type}
              <AnimatePresence>
                {done >= 4 && scope.scope && (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                    ({scope.scope})
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          )}
          {done >= 3 && (
            <motion.span
              key={`${runId}-confidence`}
              layout
              className="text-xs text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {type.confidence === "high" ? "decided by rules" : "a hint for the AI"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <ul className="mt-1 min-h-9 space-y-0.5 text-xs text-muted">
        {done >= 3 && (
          <motion.li key={`${runId}-t`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            type: {type.reasons.join("; ")}
          </motion.li>
        )}
        {done >= 4 && (
          <motion.li key={`${runId}-s`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            scope: {scope.reasons.join("; ")}
          </motion.li>
        )}
      </ul>

      {/* Files, classified */}
      <motion.ul
        key={runId}
        className="mt-3 divide-y divide-border text-sm"
        initial="hidden"
        animate={done >= 1 ? "show" : "hidden"}
        variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.06) } } }}
      >
        {files.map((f) => (
          <motion.li
            key={f.path + f.oldPath}
            className="flex items-center gap-2 py-1.5"
            variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } } }}
          >
            <span className="min-w-0 flex-1 truncate font-mono text-xs" title={f.path}>
              {f.oldPath !== f.path ? `${f.oldPath} → ${f.path}` : f.path}
            </span>
            <span className="font-mono text-xs text-add-text">+{f.additions}</span>
            <span className="font-mono text-xs text-del-text">-{f.deletions}</span>
            <motion.span
              className={`rounded px-1.5 py-0.5 text-[11px] ${f.noiseReason ? "bg-surface text-muted line-through" : (CATEGORY_STYLE[f.category] ?? "bg-surface text-muted")}`}
              title={f.noiseReason ? `Ignored: ${f.noiseReason}` : undefined}
              initial={false}
              animate={done >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
            >
              {f.category}
            </motion.span>
          </motion.li>
        ))}
      </motion.ul>
      {analysis.dropped.length > 0 && done >= 2 && (
        <motion.p className="mt-2 text-xs text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Struck-through files are noise: listed by name, never sent to an AI.
        </motion.p>
      )}
    </div>
  );
}

export type StepState = "pending" | "active" | "done" | "error";

/** A pipeline node: hollow when pending, a spinning ring when active, a check when done, a cross on error. */
export function StepDot({ state }: { state: StepState }) {
  return (
    <span className="relative grid h-6 w-6 place-items-center">
      {state === "active" && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-accent/25 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      )}
      <motion.span
        className={`grid h-4 w-4 place-items-center rounded-full border ${
          state === "done"
            ? "border-accent bg-accent text-background"
            : state === "error"
              ? "border-del-text bg-del-text text-background"
              : state === "active"
                ? "border-accent bg-accent/20"
                : "border-border bg-surface"
        }`}
        initial={false}
        animate={{ scale: state === "done" || state === "error" ? [0.6, 1.15, 1] : 1 }}
        transition={{ duration: 0.35 }}
      >
        {state === "done" && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <motion.path d="M2.5 6.5l2.2 2.2L9.5 3.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
          </svg>
        )}
        {state === "error" && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
          </svg>
        )}
      </motion.span>
    </span>
  );
}
