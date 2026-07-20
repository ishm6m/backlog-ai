"use client";

import { useState } from "react";
import { deleteAccount } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirm("");
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Delete account</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This permanently removes every application, contact, note, and document. Export your CSV
          first if you want a copy. This can&apos;t be undone.
        </p>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Type DELETE to confirm"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={confirm !== "DELETE"} onClick={() => deleteAccount()}>
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
