"use client";

import { updateApplication } from "@/app/applications/actions";
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
import { SOURCES, STAGES, STAGE_LABELS, type Application } from "@/lib/types";
import { toast } from "sonner";

export function ApplicationForm({ application }: { application: Application }) {
  const action = updateApplication.bind(null, application.id);

  return (
    <form
      action={async (formData) => {
        await action(formData);
        toast.success("Saved");
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company</Label>
          <Input id="companyName" name="companyName" defaultValue={application.companyName} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roleTitle">Role title</Label>
          <Input id="roleTitle" name="roleTitle" defaultValue={application.roleTitle} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jobUrl">Job posting URL</Label>
        <Input id="jobUrl" name="jobUrl" type="url" defaultValue={application.jobUrl ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={application.location ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salaryRange">Salary range</Label>
          <Input id="salaryRange" name="salaryRange" defaultValue={application.salaryRange ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <Select name="source" defaultValue={application.source}>
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
          <Select name="stage" defaultValue={application.stage}>
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
        <Input
          id="appliedDate"
          name="appliedDate"
          type="date"
          defaultValue={application.appliedDate ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jobDescription">Job description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          rows={6}
          defaultValue={application.jobDescription ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={application.notes} />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
