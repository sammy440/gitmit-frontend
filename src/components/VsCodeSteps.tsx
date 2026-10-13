"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import step1 from "../../public/image-1.png";
import step2 from "../../public/image-2.png";
import step3 from "../../public/image-3.png";
import step4 from "../../public/image-4.png";
import step5 from "../../public/image-5.png";

interface Step {
  title: string;
  body: React.ReactNode;
  image: StaticImageData;
  alt: string;
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px]">{children}</kbd>
);

const STEPS: Step[] = [
  {
    title: "Search for gitmit",
    body: (
      <>
        Open the Extensions view (<Kbd>⇧⌘X</Kbd> on macOS, <Kbd>Ctrl+Shift+X</Kbd> on Windows and Linux) and search for{" "}
        <strong className="font-semibold text-foreground">gitmit</strong>.
      </>
    ),
    image: step1,
    alt: "The VS Code Extensions view with gitmit typed in the search box, showing the gitmit: Commit Messages extension with an Install button.",
  },
  {
    title: "Open it and click Install",
    body: (
      <>
        Look for <strong className="font-semibold text-foreground">gitmit: Commit Messages</strong> by gitmit, with the cat
        and mouse icon. The page lists everything it does.
      </>
    ),
    image: step2,
    alt: "The gitmit: Commit Messages extension page in VS Code, showing its description, an Install button and the Marketplace details.",
  },
  {
    title: "Trust the publisher",
    body: (
      <>
        VS Code asks before installing from a publisher for the first time. Choose{" "}
        <strong className="font-semibold text-foreground">Trust Publisher &amp; Install</strong>.
      </>
    ),
    image: step3,
    alt: "VS Code's dialog asking whether to trust the publisher gitmit, with a Trust Publisher & Install button.",
  },
  {
    title: "Stage your changes and click ✨",
    body: (
      <>
        In Source Control, stage your changes, then click the{" "}
        <strong className="font-semibold text-foreground">✨ sparkle</strong> button next to the repository name. Nothing
        staged? gitmit offers to stage everything.
      </>
    ),
    image: step4,
    alt: "The Source Control panel with staged changes and the gitmit sparkle button next to the repository name.",
  },
  {
    title: "Review the message and commit",
    body: (
      <>
        Pick a suggestion and it lands in the commit box, following your team&apos;s rules. Read it, edit if you like, and
        click <strong className="font-semibold text-foreground">Commit</strong>.
      </>
    ),
    image: step5,
    alt: "The Source Control commit box filled with a gitmit message: chore: update core dependency and add new logos, with bullet points.",
  },
];

const STEP_MS = 5500;

/** Five steps from finding the extension to committing, with screenshots that play through on their own until clicked. */
export function VsCodeSteps() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const reduceMotion = useReducedMotion();
  const playing = autoplay && !reduceMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [active, playing]);

  const select = (index: number) => {
    setAutoplay(false);
    setActive(index);
  };
  const step = STEPS[active]!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:items-start">
      <ol className="order-2 flex flex-col gap-2 lg:order-1" aria-label="Install steps">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => select(i)}
                aria-current={isActive ? "step" : undefined}
                className={`relative w-full overflow-hidden rounded-lg border p-4 text-left transition-colors ${
                  isActive ? "border-accent/60 bg-surface" : "border-border hover:border-accent/40 hover:bg-surface/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-xs transition-colors ${
                      isActive ? "bg-accent text-background" : "bg-surface text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-medium ${isActive ? "" : "text-muted"}`}>{s.title}</p>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.p
                          className="text-sm leading-relaxed text-muted"
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 6 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {s.body}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {isActive && playing && (
                  <motion.span
                    key={`progress-${active}`}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* On small screens the screenshot comes first, so it stays next to the step being read. */}
      <div className="relative order-1 overflow-hidden rounded-xl border border-border bg-[#1f1f1f] shadow-2xl shadow-black/20 lg:order-2">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 min-w-0 truncate font-mono text-[11px] text-white/50">
            Step {active + 1} of {STEPS.length}: {step.title}
          </span>
        </div>
        <div className="relative aspect-[16/10]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0 p-3 sm:p-4"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  className="rounded-md object-contain"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
