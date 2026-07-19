"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAGE_LABELS, type Application, type Stage } from "@/lib/types";

export function PipelineTable({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  const presentStages = Array.from(new Set(applications.map((a) => a.stage))) as Stage[];
  const filtered =
    stageFilter === "all" ? applications : applications.filter((a) => a.stage === stageFilter);

  return (
    <div className="space-y-4">
      {presentStages.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={stageFilter === "all" ? "default" : "outline"}
            onClick={() => setStageFilter("all")}
          >
            All ({applications.length})
          </Button>
          {presentStages.map((stage) => (
            <Button
              type="button"
              key={stage}
              size="sm"
              variant={stageFilter === stage ? "default" : "outline"}
              onClick={() => setStageFilter(stage)}
            >
              {STAGE_LABELS[stage]}
            </Button>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => (
              <TableRow
                key={app.id}
                className="cursor-pointer"
                onClick={() => router.push(`/applications/${app.id}`)}
              >
                <TableCell className="font-medium">{app.companyName}</TableCell>
                <TableCell>{app.roleTitle}</TableCell>
                <TableCell>
                  <StageBadge stage={app.stage} />
                </TableCell>
                <TableCell className="text-muted-foreground">{app.location ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(app.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
