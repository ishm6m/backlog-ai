"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateStage } from "@/app/applications/actions";
import { runAction } from "@/lib/run-action";
import { StageBadge } from "@/components/stage-badge";
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
} from "@/lib/types";

const OPEN_STAGES = STAGES.filter((s) => s !== "closed");

export function StageMenu({
  app,
}: {
  app: Pick<Application, "id" | "companyName" | "stage" | "closeReason"> &
    Partial<Pick<Application, "interviewDate">>;
}) {
  const router = useRouter();
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
              const ok = await runAction(
                () => updateStage(app.id, stage),
                `${app.companyName} → ${STAGE_LABELS[stage]}`,
                () => updateStage(app.id, app.stage, app.closeReason ?? undefined)
              );
              if (ok && stage === "interviewing" && !app.interviewDate) {
                toast.info("When's the interview?", {
                  action: { label: "Set date", onClick: () => router.push(`/applications/${app.id}`) },
                });
              }
            }}
          >
            {STAGE_LABELS[stage]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {CLOSE_REASONS.map((reason) => (
          <DropdownMenuItem
            key={reason}
            disabled={app.stage === "closed" && app.closeReason === reason}
            onClick={() =>
              runAction(
                () => updateStage(app.id, "closed", reason),
                `${app.companyName} closed — ${CLOSE_REASON_LABELS[reason].toLowerCase()}`,
                () => updateStage(app.id, app.stage, app.closeReason ?? undefined)
              )
            }
          >
            Close · {CLOSE_REASON_LABELS[reason]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
