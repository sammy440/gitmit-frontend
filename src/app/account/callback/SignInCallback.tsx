"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setToken, signInUrl } from "@/lib/account";

const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled on GitHub.",
  invalid_state: "The sign-in link expired or was started in another browser. Please try again.",
  github_rejected: "GitHub didn't complete the sign-in. Please try again.",
  failed: "Something went wrong while signing in. Please try again.",
};

/** Stores the session from the URL fragment after GitHub sign-in, then removes it from the address bar. */
export function SignInCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname);
    const token = params.get("token");
    if (token && /^gmt_[A-Za-z0-9_-]{43}$/.test(token)) {
      setToken(token);
      const back = params.get("return") ?? "/account";
      router.replace(back.startsWith("/") && !back.startsWith("//") ? back : "/account");
    } else {
      // The fragment only exists in the browser, so it can only be read after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(ERRORS[params.get("error") ?? "failed"] ?? ERRORS.failed!);
    }
  }, [router]);

  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Couldn&apos;t sign you in</h1>
          <p className="mt-3 text-muted">{error}</p>
          <div className="mt-8 flex justify-center gap-3 text-sm">
            <a href={signInUrl()} className="rounded-md bg-accent px-4 py-2 font-semibold text-background hover:opacity-90">
              Try again
            </a>
            <Link href="/" className="rounded-md border border-border px-4 py-2 font-medium hover:border-accent">
              Home
            </Link>
          </div>
        </>
      ) : (
        <p className="text-muted">Signing you in…</p>
      )}
    </div>
  );
}
