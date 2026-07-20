"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { markMessaged } from "@/app/applications/actions";
import { Button } from "@/components/ui/button";

export function MessagedButton({
  contactId,
  applicationId,
  contactName,
}: {
  contactId: string;
  applicationId: string;
  contactName: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await markMessaged(contactId, applicationId);
        setPending(false);
        toast.success(`Logged message to ${contactName} — follow-up reminder in 5 days`);
      }}
    >
      <Send /> {pending ? "Logging…" : "Messaged"}
    </Button>
  );
}
