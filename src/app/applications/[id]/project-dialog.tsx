"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createCustomProject,
  updateCustomProject,
  deleteCustomProject,
} from "@/app/applications/actions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type CustomProject } from "@/lib/types";

export function ProjectDialog({
  applicationId,
  project,
}: {
  applicationId: string;
  project?: CustomProject;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!project;
  const action = isEdit
    ? updateCustomProject.bind(null, project.id, applicationId)
    : createCustomProject.bind(null, applicationId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isEdit ? "ghost" : "outline"} size="sm" />}>
        {isEdit ? "Edit" : "Add project"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "Add custom project"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={project?.title} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={project?.description} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="projectUrl">Project URL</Label>
            <Input id="projectUrl" name="projectUrl" defaultValue={project?.projectUrl ?? ""} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status ?? "idea"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PROJECT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sentDate">Sent date</Label>
              <Input id="sentDate" name="sentDate" type="date" defaultValue={project?.sentDate ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="repliedDate">Replied date</Label>
            <Input id="repliedDate" name="repliedDate" type="date" defaultValue={project?.repliedDate ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={project?.notes} />
          </div>

          <div className="flex justify-between pt-2">
            {isEdit ? (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await deleteCustomProject(project.id, applicationId);
                  setOpen(false);
                }}
              >
                <Trash2 /> Delete
              </Button>
            ) : (
              <div />
            )}
            <SubmitButton pendingText={isEdit ? "Saving…" : "Adding…"}>
              {isEdit ? "Save" : "Add project"}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
