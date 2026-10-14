import type { Metadata } from "next";
import { SignInCallback } from "./SignInCallback";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default function CallbackPage() {
  return <SignInCallback />;
}
