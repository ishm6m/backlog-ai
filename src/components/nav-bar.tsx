"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickAdd } from "@/components/quick-add";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/applications", label: "Pipeline" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
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
        <QuickAdd />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="sm" aria-label="Account" />}
          >
            <CircleUserRound className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/billing")}>
              Billing &amp; usage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
