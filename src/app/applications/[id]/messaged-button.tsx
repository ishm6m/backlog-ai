"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { markMessaged } from "@/app/applications/actions";
import { runAction } from "@/lib/run-action";
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
        await runAction(
          () => markMessaged(contactId, applicationId),
          `Logged message to ${contactName} — follow-up reminder in 5 days`
        );
        setPending(false);
      }}
    >
      <Send /> {pending ? "Logging…" : "Messaged"}
    </Button>
  );
}
