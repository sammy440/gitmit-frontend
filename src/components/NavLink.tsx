"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** A nav link that marks itself as the current page (for "/docs/..." and "/account"). */
export function NavLink({
  href,
  label,
  match,
  className = "",
  onClick,
}: {
  href: string;
  label: string;
  match?: string;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const current = match ? pathname === match || pathname.startsWith(`${match}/`) : false;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={`transition-colors hover:text-foreground ${current ? "text-foreground" : ""} ${className}`}
    >
      {label}
    </Link>
  );
}
