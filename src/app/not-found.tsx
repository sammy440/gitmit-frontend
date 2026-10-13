import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-32">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
      <p className="mt-3 text-muted">It may have moved, or the link may be wrong.</p>
      <div className="mt-8 flex gap-3 text-sm">
        <Link href="/" className="rounded-md bg-accent px-4 py-2 font-semibold text-background hover:opacity-90">
          Home
        </Link>
        <Link href="/docs" className="rounded-md border border-border px-4 py-2 font-medium hover:border-accent">
          Documentation
        </Link>
      </div>
    </div>
  );
}
