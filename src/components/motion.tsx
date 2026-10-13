"use client";

import { MotionConfig, motion, stagger, type Variants } from "motion/react";

/** Respects the visitor's "reduce motion" setting for every animation on the site. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

/** Fades and lifts its content into view, once, when it scrolls into the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  onMount = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Animate on page load instead of on scroll (for content above the fold). */
  onMount?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      {...(onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-80px" } })}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Children wrapped in <StaggerItem> animate in one after another. */
export function Stagger({
  children,
  className,
  interval = 0.08,
  delay = 0,
  onMount = false,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  interval?: number;
  delay?: number;
  onMount?: boolean;
  as?: "div" | "ol" | "ul";
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      {...(onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-80px" } })}
      variants={{ hidden: {}, show: { transition: { delayChildren: stagger(interval, { startDelay: delay }) } } }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Component = motion[as];
  return (
    <Component className={className} variants={fadeUp}>
      {children}
    </Component>
  );
}
