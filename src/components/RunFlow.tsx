"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { StepDot, type StepState } from "./AnalysisFlow";

export interface FlowStep {
  label: string;
  state: StepState;
}

/**
 * The request in flight: each step of the run with its live state, and a
 * running clock while it works.
 */
export function RunFlow({ steps, startedAt, finishedAt }: { steps: FlowStep[]; startedAt: number; finishedAt?: number }) {
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    if (finishedAt) return;
    let frame = 0;
    const tick = () => {
      setNow(performance.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finishedAt]);

  const elapsed = ((finishedAt ?? now) - startedAt) / 1000;
  const failed = steps.some((s) => s.state === "error");

  return (
    <motion.div
      className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Request</h3>
        <span className={`ml-auto font-mono text-[11px] ${failed ? "text-del-text" : "text-muted"}`}>
          {finishedAt ? (failed ? "stopped" : "done") : "running"} · {elapsed.toFixed(2)} s
        </span>
      </div>
      <ol className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => (
          <li key={step.label} className="relative">
            {i < steps.length - 1 && (
              <div className="absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-[11px] h-px overflow-hidden bg-border">
                <motion.div
                  className="h-full origin-left bg-accent"
                  initial={false}
                  animate={{ scaleX: step.state === "done" ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}
            <div className="flex flex-col items-center text-center">
              <StepDot state={step.state} />
              <span
                className={`mt-1.5 text-[11px] font-medium leading-tight ${
                  step.state === "pending" ? "text-muted" : step.state === "error" ? "text-del-text" : ""
                }`}
              >
                {step.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
