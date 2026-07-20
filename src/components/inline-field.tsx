"use client";

import { useState } from "react";
import { updateApplicationField, type ApplicationFieldPatch } from "@/app/applications/actions";
import { cn } from "@/lib/utils";

type FieldName = keyof ApplicationFieldPatch;

export function InlineTextarea({
  applicationId,
  name,
  value,
  placeholder,
  rows = 4,
  nullable = false,
}: {
  applicationId: string;
  name: FieldName;
  value: string | null;
  placeholder: string;
  rows?: number;
  nullable?: boolean;
}) {
  const [draft, setDraft] = useState(value ?? "");

  return (
    <textarea
      rows={rows}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const next = draft.trim() === "" && nullable ? null : draft;
        if (next !== value) updateApplicationField(applicationId, { [name]: next });
      }}
      placeholder={placeholder}
      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

export function InlineField({
  applicationId,
  name,
  value,
  placeholder,
  type = "text",
  className,
  nullable = true,
}: {
  applicationId: string;
  name: FieldName;
  value: string | null;
  placeholder: string;
  type?: "text" | "date" | "url";
  className?: string;
  nullable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  async function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    const next = trimmed === "" ? (nullable ? null : value ?? "") : trimmed;
    if (next === value) return;
    if (next === null || typeof next === "string") {
      await updateApplicationField(applicationId, { [name]: next });
    }
  }

  if (editing) {
    return (
      <input
        type={type}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        className={cn(
          "rounded-md border bg-background px-1.5 py-0.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value ?? "");
        setEditing(true);
      }}
      className={cn(
        "cursor-text rounded-md px-1.5 py-0.5 text-left text-sm transition-colors hover:bg-accent",
        value ? "" : "text-muted-foreground/60 italic",
        className
      )}
    >
      {value || placeholder}
    </button>
  );
}
