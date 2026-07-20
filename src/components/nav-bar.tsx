"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Pipeline" },
  { href: "/billing", label: "Billing" },
];

export function NavBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;

  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <img src="/logo.png" alt="Backlog AI" className="h-6 w-6 rounded-md" />
          Backlog
        </Link>
        <nav className="flex flex-1 gap-4 text-sm">
          {LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
