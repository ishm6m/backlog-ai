import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, type Stage } from "@/lib/types";

const STAGE_VARIANT: Record<Stage, string> = {
  researching: "bg-muted text-muted-foreground",
  applied: "bg-accent text-accent-foreground",
  outreach_sent: "bg-chart-1/15 text-chart-1",
  project_sent: "bg-chart-4/15 text-chart-4",
  interviewing: "bg-chart-3/20 text-chart-3",
  offer: "bg-chart-2/20 text-chart-2",
  rejected: "bg-destructive/10 text-destructive",
  ghosted: "border border-border bg-transparent text-muted-foreground",
  withdrawn: "border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Badge variant="outline" className={`border-transparent font-normal ${STAGE_VARIANT[stage]}`}>
      {STAGE_LABELS[stage]}
    </Badge>
  );
}
