import { Badge } from "@/components/ui/badge";
import { CLOSE_REASON_LABELS, STAGE_LABELS, type CloseReason, type Stage } from "@/lib/types";

const STAGE_VARIANT: Record<Stage, string> = {
  saved: "bg-muted text-muted-foreground",
  applied: "bg-accent text-accent-foreground",
  interviewing: "bg-chart-3/20 text-chart-3",
  offer: "bg-chart-2/20 text-chart-2",
  closed: "border border-border bg-transparent text-muted-foreground",
};

export function StageBadge({ stage, closeReason }: { stage: Stage; closeReason?: CloseReason | null }) {
  const label =
    stage === "closed" && closeReason ? CLOSE_REASON_LABELS[closeReason] : STAGE_LABELS[stage];
  return (
    <Badge variant="outline" className={`border-transparent font-normal ${STAGE_VARIANT[stage]}`}>
      {label}
    </Badge>
  );
}
