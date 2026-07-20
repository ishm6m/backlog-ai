"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { extractJobPosting, quickCreateApplication } from "@/app/applications/actions";
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

export function QuickAdd() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: string; companyName: string; roleTitle: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setPasted("");
    setExtracted(null);
    setDuplicate(null);
  }

  async function handleExtract() {
    setExtracting(true);
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
      <DialogTrigger render={<Button size="sm" />}>
        <Plus /> Add
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a job</DialogTitle>
        </DialogHeader>

        {!extracted ? (
          <div className="space-y-3">
            <Textarea
              rows={7}
              autoFocus
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Paste the job posting — AI pulls out the company, role, and details"
            />
            <div className="flex items-center justify-between">
              <Link
                href="/applications/new"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Use the full form instead
              </Link>
              <Button onClick={handleExtract} disabled={extracting || !pasted.trim()}>
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

            {duplicate && (
              <div className="rounded-lg border border-dashed px-4 py-3 text-sm">
                <p className="mb-2">
                  Looks like a duplicate of <span className="font-medium">{duplicate.companyName} — {duplicate.roleTitle}</span>.
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
                  <Button variant="ghost" size="sm" onClick={() => handleSave(true)} disabled={saving}>
                    Add anyway
                  </Button>
                </div>
              </div>
            )}

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
