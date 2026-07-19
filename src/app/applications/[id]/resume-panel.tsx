"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tailorResume, saveDocument } from "@/app/applications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Document } from "@/lib/types";

const BASE_RESUME_KEY = "backlog-ai-base-resume";

export function ResumePanel({
  applicationId,
  jobDescription,
  documents,
}: {
  applicationId: string;
  jobDescription: string | null;
  documents: Document[];
}) {
  const router = useRouter();
  const [baseResume, setBaseResume] = useState(
    () => (typeof window !== "undefined" && localStorage.getItem(BASE_RESUME_KEY)) || ""
  );
  const [tailored, setTailored] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!baseResume.trim() || !jobDescription) return;
    localStorage.setItem(BASE_RESUME_KEY, baseResume);
    setGenerating(true);
    const result = await tailorResume(jobDescription, baseResume);
    setGenerating(false);
    if (typeof result !== "string") {
      toast.error(result.error);
      return;
    }
    setTailored(result);
    toast.success("Tailored draft ready — review before saving");
  }

  async function handleSave() {
    setSaving(true);
    await saveDocument(applicationId, "resume", tailored, versionLabel);
    setSaving(false);
    setVersionLabel("");
    router.refresh();
    toast.success("Saved resume version");
  }

  return (
    <div className="space-y-4">
      {!jobDescription && (
        <p className="text-sm text-muted-foreground">
          Add a job description to this application before tailoring a resume.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="baseResume">Base resume</Label>
        <Textarea
          id="baseResume"
          rows={6}
          value={baseResume}
          onChange={(e) => setBaseResume(e.target.value)}
          placeholder="Paste your base resume text — this is remembered on this device for next time"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={handleGenerate}
          disabled={generating || !baseResume.trim() || !jobDescription}
        >
          {generating ? "Tailoring…" : "Generate tailored resume"}
        </Button>
      </div>

      {tailored && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <Label htmlFor="tailored">Tailored draft (edit before saving)</Label>
          <Textarea
            id="tailored"
            rows={14}
            value={tailored}
            onChange={(e) => setTailored(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Input
              placeholder="Version label (e.g. v1)"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
            />
            <Button type="button" onClick={handleSave} disabled={saving || !tailored.trim()}>
              {saving ? "Saving…" : "Save version"}
            </Button>
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Saved versions</p>
          {documents.map((doc) => (
            <details key={doc.id} className="rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40">
              <summary className="cursor-pointer text-sm font-medium">
                {doc.versionLabel}
                <span className="ml-2 font-normal text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{doc.content}</pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
