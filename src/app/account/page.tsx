import type { Metadata } from "next";
import { AccountPage } from "./AccountPage";

export const metadata: Metadata = {
  title: "Account",
  description: "Save your OpenAI or Anthropic key once and use it on the website, in the gitmit CLI and in VS Code.",
};

export default function Page() {
  return <AccountPage />;
}
