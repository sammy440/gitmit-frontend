export const SITE = {
  name: "gitmit",
  tagline: "Commit messages that follow your team's rules.",
  description:
    "Clean, convention-compliant git commit messages from your staged changes. Works offline, keeps secrets on your machine, follows your commitlint rules, and splits messy changes into focused commits.",
  github: "https://github.com/sammy440/gitmit",
  npm: "https://www.npmjs.com/package/@gitmit/cli",
  install: "npm install -g @gitmit/cli",
  vscode: {
    marketplace: "https://marketplace.visualstudio.com/items?itemName=gitmit.gitmit",
    /** Opens the extension's page directly in VS Code. */
    deepLink: "vscode:extension/gitmit.gitmit",
    install: "code --install-extension gitmit.gitmit",
  },
  /** Where Cursor, Windsurf, VSCodium and other VS Code-based editors get extensions. */
  openVsx: "https://open-vsx.org/extension/gitmit/gitmit",
};

/** The pass-through API used only when a visitor brings their own key. */
export const API_URL = (process.env.NEXT_PUBLIC_GITMIT_API_URL ?? "http://localhost:8787").replace(/\/+$/, "");
