"use client";

import { updateApplicationField } from "@/app/applications/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOURCES, type Source } from "@/lib/types";

export function SourceSelect({ applicationId, value }: { applicationId: string; value: Source }) {
  return (
    <Select
      value={value}
      onValueChange={(v) => updateApplicationField(applicationId, { source: v as Source })}
    >
      <SelectTrigger className="h-7 border-none bg-transparent px-1.5 text-sm shadow-none hover:bg-accent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SOURCES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
