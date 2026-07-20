"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createApplication, extractJobPosting } from "@/app/applications/actions";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOURCES, STAGES, STAGE_LABELS, type Source } from "@/lib/types";

type Extracted = {
  companyName: string;
  roleTitle: string;
  location: string;
  salaryRange: string;
  source: Source;
  jobDescription: string;
};

export default function NewApplicationPage() {
  const [pasted, setPasted] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);

  async function handleExtract() {
    if (!pasted.trim()) return;
    setExtracting(true);
    const result = await extractJobPosting(pasted);
    setExtracting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setExtracted(result);
    toast.success("Extracted — review before saving");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground">
          ← Pipeline
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New application</h1>
        <p className="text-sm text-muted-foreground">
          Enter what you know now — you can fill in the rest later.
        </p>
      </div>

      <div className="mb-6 space-y-3 rounded-xl border bg-card p-4">
        <Label htmlFor="pasted">Paste job posting (optional)</Label>
        <Textarea
          id="pasted"
          rows={6}
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="Paste the full job posting text and let AI fill in the fields below"
        />
        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={handleExtract} disabled={extracting || !pasted.trim()}>
            {extracting ? "Extracting…" : "Extract with AI"}
          </Button>
        </div>
      </div>

      <form action={createApplication} className="space-y-5" key={extracted ? JSON.stringify(extracted) : "empty"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company</Label>
            <Input id="companyName" name="companyName" defaultValue={extracted?.companyName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleTitle">Role title</Label>
            <Input id="roleTitle" name="roleTitle" defaultValue={extracted?.roleTitle} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jobUrl">Job posting URL</Label>
          <Input id="jobUrl" name="jobUrl" type="url" placeholder="https://…" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={extracted?.location} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salaryRange">Salary range</Label>
            <Input
              id="salaryRange"
              name="salaryRange"
              placeholder="e.g. $130k–$160k"
              defaultValue={extracted?.salaryRange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <Select name="source" defaultValue={extracted?.source ?? "LinkedIn"}>
              <SelectTrigger id="source" className="w-full">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stage">Stage</Label>
            <Select name="stage" defaultValue="saved">
              <SelectTrigger id="stage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="appliedDate">Applied date</Label>
          <Input id="appliedDate" name="appliedDate" type="date" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jobDescription">Job description</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            rows={6}
            placeholder="Paste the job description here"
            defaultValue={extracted?.jobDescription}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" render={<Link href="/applications" />} nativeButton={false}>
            Cancel
          </Button>
          <SubmitButton pendingText="Saving…">Save application</SubmitButton>
        </div>
      </form>
    </div>
  );
}
