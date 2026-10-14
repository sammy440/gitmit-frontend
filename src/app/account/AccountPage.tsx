"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { GitHubIcon } from "@/components/icons";
import { accountApi, AccountError, clearToken, getToken, signInUrl, type Account, type KeyProvider } from "@/lib/account";

const PROVIDERS: { id: KeyProvider; name: string; placeholder: string; models: string; keysUrl: string }[] = [
  { id: "openai", name: "OpenAI", placeholder: "sk-...", models: "e.g. gpt-5-mini (default)", keysUrl: "https://platform.openai.com/api-keys" },
  {
    id: "anthropic",
    name: "Anthropic",
    placeholder: "sk-ant-...",
    models: "e.g. claude-opus-5-5 (default)",
    keysUrl: "https://console.anthropic.com/settings/keys",
  },
];

const CLIENT_LABEL = { web: "Website", cli: "Command line", vscode: "Editor" } as const;

type State = { status: "loading" } | { status: "signed-out" } | { status: "ready"; account: Account } | { status: "error"; message: string };

export function AccountPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    if (!getToken()) {
      setState({ status: "signed-out" });
      return;
    }
    try {
      setState({ status: "ready", account: await accountApi.me() });
    } catch (error) {
      if (error instanceof AccountError && error.status === 401) setState({ status: "signed-out" });
      else setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }, []);

  useEffect(() => {
    // Reading localStorage must wait until the page is in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {state.status === "loading" && <p className="text-muted">Loading your account…</p>}
      {state.status === "signed-out" && <SignedOut />}
      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-del-text/40 bg-del p-4 text-sm text-del-text">
          {state.message}{" "}
          <button type="button" onClick={load} className="underline underline-offset-2">
            Try again
          </button>
        </div>
      )}
      {state.status === "ready" && <SignedIn account={state.account} reload={load} onSignedOut={() => setState({ status: "signed-out" })} />}
    </div>
  );
}

function SignedOut() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Your gitmit account</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Save your OpenAI or Anthropic key once, and use it everywhere: on this website, in the <code className="font-mono">gitmit</code>{" "}
        command and in your editor (VS Code, Cursor, Windsurf, VSCodium). No more pasting keys.
      </p>
      <a
        href={signInUrl("/account")}
        className="mt-8 inline-flex items-center gap-2.5 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
      >
        <GitHubIcon className="h-5 w-5" />
        Sign in with GitHub
      </a>
      <ul className="mt-12 grid gap-4 text-sm sm:grid-cols-2">
        {[
          ["Write-only keys", "Once saved, your key can't be read back, not even by you. You'll only ever see its last four characters."],
          ["Encrypted at rest", "Keys are encrypted with AES-256-GCM. The encryption key lives only in the server's environment, never in the database."],
          ["Your code stays local", "The CLI and the editor extension scan and summarize your changes on your machine. Only that summary is relayed to the AI, never your diff."],
          ["Delete any time", "Remove a key, sign out a device, or delete your account and everything in it, instantly."],
        ].map(([title, body]) => (
          <li key={title} className="rounded-lg border border-border p-4">
            <p className="font-medium">{title}</p>
            <p className="mt-1 leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Prefer not to store a key? You don&apos;t have to: gitmit works with a local key, a local model, or offline rules.{" "}
        <Link href="/docs/privacy" className="text-accent underline-offset-4 hover:underline">
          How gitmit handles your data
        </Link>
      </p>
    </div>
  );
}

function SignedIn({ account, reload, onSignedOut }: { account: Account; reload: () => Promise<void>; onSignedOut: () => void }) {
  const { user, keys, sessions } = account;

  async function signOut() {
    await accountApi.logout().catch(() => {});
    clearToken();
    onSignedOut();
  }

  return (
    <div className="space-y-12">
      <header className="flex items-center gap-4">
        {user.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-full border border-border" />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{user.name ?? user.login}</h1>
          <p className="text-sm text-muted">Signed in with GitHub as @{user.login}</p>
        </div>
        <button type="button" onClick={signOut} className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm hover:border-accent">
          Sign out
        </button>
      </header>

      <section>
        <h2 className="text-lg font-semibold">API keys</h2>
        <p className="mt-1 text-sm text-muted">
          Checked with the provider, encrypted, and never shown again. When both are saved, the most recently updated one is used.
        </p>
        <div className="mt-5 grid gap-4">
          {PROVIDERS.map((p) => (
            <KeyCard key={p.id} provider={p} saved={keys.find((k) => k.provider === p.id)} onChange={reload} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Use it everywhere</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">Command line</p>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-surface px-3 py-2 font-mono text-sm">
              <span className="flex-1">gitmit login</span>
              <CopyButton text="gitmit login" />
            </div>
            <p className="mt-2 text-xs text-muted">Then use gitmit as usual. A local key in your environment still takes priority.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">VS Code, Cursor, Windsurf</p>
            <p className="mt-3 text-sm text-muted">
              Run <span className="font-medium text-foreground">gitmit: Sign In with GitHub</span> from the command palette (
              <kbd className="font-mono text-xs">⇧⌘P</kbd>).
            </p>
            <Link href="/#vscode" className="mt-2 inline-block text-xs text-accent underline-offset-4 hover:underline">
              Install the extension
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Signed-in devices</h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onRevoked={s.current ? signOut : reload} />
          ))}
        </ul>
      </section>

      <DangerZone onDeleted={onSignedOut} />
    </div>
  );
}

function KeyCard({
  provider,
  saved,
  onChange,
}: {
  provider: (typeof PROVIDERS)[number];
  saved?: Account["keys"][number];
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(!saved);
  const [key, setKey] = useState("");
  const [model, setModel] = useState(saved?.model ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await accountApi.saveKey(provider.id, key.trim(), model.trim() || null);
      setKey("");
      setEditing(false);
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the key.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove your ${provider.name} key from gitmit?`)) return;
    setBusy(true);
    try {
      await accountApi.deleteKey(provider.id);
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the key.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-medium">{provider.name}</p>
        {saved ? (
          <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent">saved · ends in {saved.last4}</span>
        ) : (
          <span className="text-xs text-muted">not saved</span>
        )}
        {saved?.model && <span className="font-mono text-xs text-muted">model {saved.model}</span>}
        {saved && !editing && (
          <div className="ml-auto flex gap-2 text-sm">
            <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-border px-3 py-1 hover:border-accent">
              Replace
            </button>
            <button type="button" onClick={remove} disabled={busy} className="rounded-md border border-border px-3 py-1 text-del-text hover:border-del-text">
              Remove
            </button>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {editing && (
          <motion.form
            onSubmit={save}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={provider.placeholder}
                autoComplete="off"
                required
                aria-label={`${provider.name} API key`}
                className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={busy || !key.trim()}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Checking…" : saved ? "Replace key" : "Save key"}
              </button>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={`Model (optional), ${provider.models}`}
                aria-label={`${provider.name} model`}
                className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent sm:col-span-2"
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Get a key from{" "}
              <a href={provider.keysUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {provider.name}
              </a>
              . gitmit checks it works, encrypts it, and never shows it again.
              {saved && (
                <>
                  {" "}
                  <button type="button" onClick={() => setEditing(false)} className="underline underline-offset-2">
                    Cancel
                  </button>
                </>
              )}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
      {error && (
        <p role="alert" className="mt-3 text-sm text-del-text">
          {error}
        </p>
      )}
    </div>
  );
}

function SessionRow({ session, onRevoked }: { session: Account["sessions"][number]; onRevoked: () => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "never");
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {CLIENT_LABEL[session.client]}
          {session.current && <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs text-accent">this browser</span>}
        </p>
        <p className="truncate text-xs text-muted">
          {session.label ? `${session.label} · ` : ""}signed in {when(session.createdAt)} · last used {when(session.lastUsedAt)}
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await accountApi.revokeSession(session.id).catch(() => {});
          await onRevoked();
          setBusy(false);
        }}
        className="rounded-md border border-border px-3 py-1 hover:border-del-text hover:text-del-text"
      >
        Sign out
      </button>
    </li>
  );
}

function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm("Delete your gitmit account? Your saved keys are erased and every device is signed out. This can't be undone.")) return;
    setBusy(true);
    try {
      await accountApi.deleteAccount();
      clearToken();
      onDeleted();
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-lg border border-del-text/30 p-4">
      <h2 className="font-semibold">Delete account</h2>
      <p className="mt-1 text-sm text-muted">Erases your saved keys and signs out every device. Your GitHub account isn&apos;t affected.</p>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="mt-3 rounded-md border border-del-text/50 px-3 py-1.5 text-sm text-del-text hover:bg-del"
      >
        {busy ? "Deleting…" : "Delete my account"}
      </button>
    </section>
  );
}
