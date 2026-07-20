"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { extractJobPosting, findDuplicateInText, quickCreateApplication } from "@/app/applications/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Source } from "@/lib/types";

type Extracted = {
  companyName: string;
  roleTitle: string;
  location: string;
  salaryRange: string;
  source: Source;
  jobDescription: string;
};

export function QuickAdd({
  global = false,
  label = "Add",
  variant = "default",
  size = "sm",
}: {
  global?: boolean;
  label?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string; companyName: string; roleTitle: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!global) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      const target = e.target as HTMLElement;
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "c") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [global]);

  function reset() {
    setPasted("");
    setExtracted(null);
    setDuplicate(null);
  }

  async function handleExtract(force = false) {
    setExtracting(true);
    if (!force) {
      const dup = await findDuplicateInText(pasted);
      if (dup) {
        setExtracting(false);
        setDuplicate(dup);
        return;
      }
    }
    setDuplicate(null);
    const result = await extractJobPosting(pasted);
    setExtracting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setExtracted(result);
  }

  async function handleSave(force: boolean) {
    if (!extracted) return;
    setSaving(true);
    const result = await quickCreateApplication(extracted, force);
    setSaving(false);
    if ("duplicateOf" in result) {
      setDuplicate(result.duplicateOf);
      return;
    }
    setOpen(false);
    reset();
    toast.success(`Saved ${extracted.companyName} — ${extracted.roleTitle}`);
    router.push(`/applications/${result.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={<Button size={size} variant={variant} />}>
        <Plus /> {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a job</DialogTitle>
        </DialogHeader>

        {duplicate && (
          <div className="rounded-lg border border-dashed px-4 py-3 text-sm">
            <p className="mb-2">
              Looks like a duplicate of{" "}
              <span className="font-medium">{duplicate.companyName} — {duplicate.roleTitle}</span>.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  reset();
                  router.push(`/applications/${duplicate.id}`);
                }}
              >
                Open existing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (extracted ? handleSave(true) : handleExtract(true))}
                disabled={saving || extracting}
              >
                Add anyway
              </Button>
            </div>
          </div>
        )}

        {!extracted ? (
          <div className="space-y-3">
            <Textarea
              rows={7}
              autoFocus
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Paste the job posting — AI pulls out the company, role, and details"
            />
            <div className="flex justify-end">
              <Button onClick={() => handleExtract()} disabled={extracting || !pasted.trim()}>
                {extracting ? "Extracting…" : "Extract"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="font-medium">{extracted.roleTitle}</p>
              <p className="text-sm text-muted-foreground">
                {extracted.companyName}
                {extracted.location && ` · ${extracted.location}`}
                {extracted.salaryRange && ` · ${extracted.salaryRange}`}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setExtracted(null)}>
                Back
              </Button>
              {!duplicate && (
                <Button onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
