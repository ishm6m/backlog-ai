"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkUpdateStage } from "@/app/applications/actions";
import { runAction } from "@/lib/run-action";
import { StageMenu } from "@/components/stage-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  STAGES,
  STAGE_LABELS,
  CLOSE_REASONS,
  CLOSE_REASON_LABELS,
  type Application,
  type CloseReason,
  type Stage,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const OPEN_STAGES = STAGES.filter((s) => s !== "closed");

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export function PipelineTable({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const filtered = q
    ? applications.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) || a.roleTitle.toLowerCase().includes(q)
      )
    : applications;

  const groups = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        // oldest first within a group — the ones rotting float to the top
        apps: filtered
          .filter((a) => a.stage === stage)
          .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()),
      })).filter((g) => g.apps.length > 0),
    [filtered]
  );

  const visible = useMemo(
    () =>
      groups.flatMap(({ stage, apps }) =>
        stage === "closed" && !showClosed && !q ? [] : apps
      ),
    [groups, showClosed, q]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "Escape" && typing) {
        target.blur();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, visible.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter" && cursor >= 0 && visible[cursor]) {
        router.push(`/applications/${visible[cursor].id}`);
      } else if (e.key === "x" && cursor >= 0 && visible[cursor]) {
        const id = visible[cursor].id;
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (e.key === "Escape") {
        setSelected(new Set());
        setCursor(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, cursor, router]);

  async function applyBulk(stage: Stage, closeReason?: CloseReason) {
    const ids = Array.from(selected);
    const ok = await runAction(
      () => bulkUpdateStage(ids, stage, closeReason),
      `${ids.length} application${ids.length > 1 ? "s" : ""} → ${
        closeReason ? CLOSE_REASON_LABELS[closeReason] : STAGE_LABELS[stage]
      }`
    );
    if (ok) setSelected(new Set());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Input
          ref={searchRef}
          type="search"
          placeholder="Search company or role…  ( / )"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <p className="hidden text-xs text-muted-foreground sm:block">
          j/k move · Enter open · x select
        </p>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              Move to…
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {OPEN_STAGES.map((stage) => (
                <DropdownMenuItem key={stage} onClick={() => applyBulk(stage)}>
                  {STAGE_LABELS[stage]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {CLOSE_REASONS.map((reason) => (
                <DropdownMenuItem key={reason} onClick={() => applyBulk("closed", reason)}>
                  Close · {CLOSE_REASON_LABELS[reason]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {groups.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No matches.</p>
      )}

      {groups.map(({ stage, apps }) => {
        const collapsed = stage === "closed" && !showClosed && !q;
        return (
          <section key={stage}>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                {STAGE_LABELS[stage]} ({apps.length})
              </h2>
              {stage === "closed" && !q && (
                <button
                  type="button"
                  onClick={() => setShowClosed((v) => !v)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  {collapsed ? "Show" : "Hide"}
                </button>
              )}
            </div>
            {!collapsed && (
              <div className="divide-y rounded-xl border bg-card">
                {apps.map((app) => {
                  const isCursor = visible[cursor]?.id === app.id;
                  const isSelected = selected.has(app.id);
                  return (
                    <div
                      key={app.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
                        isCursor && "bg-accent",
                        isSelected && "bg-primary/5"
                      )}
                      onClick={(e) => {
                        if (e.shiftKey || e.metaKey) {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(app.id)) next.delete(app.id);
                            else next.add(app.id);
                            return next;
                          });
                          return;
                        }
                        router.push(`/applications/${app.id}`);
                      }}
                    >
                      {isSelected && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className="font-medium">{app.companyName}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                        {app.roleTitle}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {daysSince(app.updatedAt)}d
                      </span>
                      <StageMenu app={app} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
