import { Badge } from "@/components/ui/badge";
import {
  OUTREACH_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  type OutreachStatus,
  type ProjectStatus,
} from "@/lib/types";

const OUTREACH_STATUS_VARIANT: Record<OutreachStatus, string> = {
  not_contacted: "bg-muted text-muted-foreground",
  message_sent: "bg-chart-1/15 text-chart-1",
  replied: "bg-chart-2/20 text-chart-2",
  no_response: "border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground",
};

export function OutreachStatusBadge({ status }: { status: OutreachStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent font-normal ${OUTREACH_STATUS_VARIANT[status]}`}>
      {OUTREACH_STATUS_LABELS[status]}
    </Badge>
  );
}

const PROJECT_STATUS_VARIANT: Record<ProjectStatus, string> = {
  idea: "bg-muted text-muted-foreground",
  in_progress: "bg-chart-1/15 text-chart-1",
  sent: "bg-accent text-accent-foreground",
  viewed: "bg-chart-3/20 text-chart-3",
  replied: "bg-chart-2/20 text-chart-2",
  no_response: "border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent font-normal ${PROJECT_STATUS_VARIANT[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
