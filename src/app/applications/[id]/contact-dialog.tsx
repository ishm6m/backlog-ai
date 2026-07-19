"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createContact, updateContact, deleteContact } from "@/app/applications/actions";
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
import {
  OUTREACH_CHANNELS,
  OUTREACH_STATUSES,
  OUTREACH_STATUS_LABELS,
  type Contact,
} from "@/lib/types";

export function ContactDialog({
  applicationId,
  contact,
}: {
  applicationId: string;
  contact?: Contact;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!contact;
  const action = isEdit
    ? updateContact.bind(null, contact.id, applicationId)
    : createContact.bind(null, applicationId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isEdit ? "ghost" : "outline"} size="sm" />}>
        {isEdit ? "Edit" : "Add contact"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={contact?.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                placeholder="Hiring Manager"
                defaultValue={contact?.role}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={contact?.linkedinUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitterUrl">Twitter/X URL</Label>
              <Input id="twitterUrl" name="twitterUrl" defaultValue={contact?.twitterUrl ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="outreachStatus">Outreach status</Label>
              <Select name="outreachStatus" defaultValue={contact?.outreachStatus ?? "not_contacted"}>
                <SelectTrigger id="outreachStatus" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTREACH_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {OUTREACH_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outreachChannel">Channel</Label>
              <Select name="outreachChannel" defaultValue={contact?.outreachChannel ?? undefined}>
                <SelectTrigger id="outreachChannel" className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {OUTREACH_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="outreachSentDate">Outreach sent</Label>
              <Input
                id="outreachSentDate"
                name="outreachSentDate"
                type="date"
                defaultValue={contact?.outreachSentDate ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repliedDate">Replied</Label>
              <Input
                id="repliedDate"
                name="repliedDate"
                type="date"
                defaultValue={contact?.repliedDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="messageSent">Message sent</Label>
            <Textarea
              id="messageSent"
              name="messageSent"
              rows={4}
              defaultValue={contact?.messageSent}
              placeholder="What you actually sent, for reuse"
            />
          </div>

          <div className="flex justify-between pt-2">
            {isEdit ? (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await deleteContact(contact.id, applicationId);
                  setOpen(false);
                }}
              >
                <Trash2 /> Delete
              </Button>
            ) : (
              <div />
            )}
            <SubmitButton pendingText={isEdit ? "Saving…" : "Adding…"}>
              {isEdit ? "Save" : "Add contact"}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
