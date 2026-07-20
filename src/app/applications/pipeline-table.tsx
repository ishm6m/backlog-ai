"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateStage } from "@/app/applications/actions";
import { StageBadge } from "@/components/stage-badge";
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
  CLOSE_REASON_LABELS,
  type Application,
  type CloseReason,
  type Stage,
} from "@/lib/types";

const OPEN_STAGES = STAGES.filter((s) => s !== "closed");
const CLOSE_OPTIONS: CloseReason[] = ["rejected", "ghosted", "withdrawn", "accepted"];

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function StageMenu({ app }: { app: Application }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <StageBadge stage={app.stage} closeReason={app.closeReason} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {OPEN_STAGES.map((stage) => (
          <DropdownMenuItem
            key={stage}
            disabled={stage === app.stage}
            onClick={async () => {
              await updateStage(app.id, stage);
              toast.success(`${app.companyName} → ${STAGE_LABELS[stage]}`);
            }}
          >
            {STAGE_LABELS[stage]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {CLOSE_OPTIONS.map((reason) => (
          <DropdownMenuItem
            key={reason}
            disabled={app.stage === "closed" && app.closeReason === reason}
            onClick={async () => {
              await updateStage(app.id, "closed", reason);
              toast.success(`${app.companyName} closed — ${CLOSE_REASON_LABELS[reason].toLowerCase()}`);
            }}
          >
            Close · {CLOSE_REASON_LABELS[reason]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PipelineTable({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? applications.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) || a.roleTitle.toLowerCase().includes(q)
      )
    : applications;

  const groups = STAGES.map((stage) => ({
    stage,
    // oldest first within a group — the ones rotting float to the top
    apps: filtered
      .filter((a) => a.stage === stage)
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()),
  })).filter((g) => g.apps.length > 0);

  return (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Search company or role…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

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
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
                    onClick={() => router.push(`/applications/${app.id}`)}
                  >
                    <span className="font-medium">{app.companyName}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {app.roleTitle}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {daysSince(app.updatedAt)}d
                    </span>
                    <StageMenu app={app} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
