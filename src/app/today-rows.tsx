"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  bulkUpdateStage,
  markFollowedUp,
  restoreStages,
  snoozeApplication,
  snoozeContact,
  updateStage,
} from "@/app/applications/actions";
import { runAction } from "@/lib/run-action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApplicationItem, FollowUpItem } from "@/lib/store";
import type { Stage, CloseReason } from "@/lib/types";

const SNOOZE_OPTIONS = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "Next week", days: 7 },
];

function SnoozeMenu({ onSnooze }: { onSnooze: (days: number) => Promise<void> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        Snooze
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SNOOZE_OPTIONS.map(({ label, days }) => (
          <DropdownMenuItem
            key={days}
            onClick={() => runAction(() => onSnooze(days), `Snoozed — back ${label.toLowerCase()}`)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      {children}
    </div>
  );
}

export function FollowUpRow({ item }: { item: FollowUpItem }) {
  const contactHref = item.linkedinUrl || (item.email ? `mailto:${item.email}` : null);
  return (
    <Row>
      <Link href={`/applications/${item.applicationId}`} className="min-w-0 flex-1 hover:underline">
        <span className="font-medium">Follow up with {item.name}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          {item.companyName} · {item.roleTitle} · messaged {item.daysSinceSent}d ago
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        {contactHref && (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<a href={contactHref} target="_blank" rel="noreferrer" />}
          >
            Message
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => runAction(() => markFollowedUp(item.id), `Logged follow-up with ${item.name}`)}
        >
          Done
        </Button>
        <SnoozeMenu onSnooze={(days) => snoozeContact(item.id, days)} />
      </div>
    </Row>
  );
}

export function ColdRow({ item }: { item: ApplicationItem }) {
  return (
    <Row>
      <Link href={`/applications/${item.id}`} className="min-w-0 flex-1 hover:underline">
        <span className="font-medium">{item.companyName}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          {item.roleTitle} · applied {item.daysSince}d ago, no movement
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            runAction(
              () => updateStage(item.id, "closed", "ghosted"),
              `Closed ${item.companyName} as ghosted`,
              () => updateStage(item.id, item.stage, item.closeReason ?? undefined)
            )
          }
        >
          Close as ghosted
        </Button>
        <SnoozeMenu onSnooze={(days) => snoozeApplication(item.id, days)} />
      </div>
    </Row>
  );
}

export function InterviewRow({ item }: { item: ApplicationItem }) {
  const when = item.daysSince === 0 ? "today" : item.daysSince === 1 ? "tomorrow" : `in ${item.daysSince} days`;
  return (
    <Row>
      <Link href={`/applications/${item.id}`} className="min-w-0 flex-1 hover:underline">
        <span className="font-medium">Interview {when} — {item.companyName}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          {item.roleTitle} · review the job description and your notes
        </span>
      </Link>
    </Row>
  );
}

export function OfferRow({ item }: { item: ApplicationItem }) {
  const due =
    item.daysSince === null
      ? "no response-by date set"
      : item.daysSince < 0
        ? `${-item.daysSince}d overdue`
        : item.daysSince === 0
          ? "respond today"
          : `respond in ${item.daysSince}d`;
  return (
    <Row>
      <Link href={`/applications/${item.id}`} className="min-w-0 flex-1 hover:underline">
        <span className="font-medium">{item.companyName}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          {item.roleTitle} · {due}
        </span>
      </Link>
    </Row>
  );
}

export function DeadApplicationsBanner({ items }: { items: ApplicationItem[] }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {items.length} application{items.length > 1 ? "s" : ""} silent for 30+ days —{" "}
        {items.map((i) => i.companyName).slice(0, 3).join(", ")}
        {items.length > 3 && ` +${items.length - 3} more`}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => router.push("/applications")}>
          Review
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            runAction(
              () => bulkUpdateStage(items.map((i) => i.id), "closed", "ghosted"),
              `Closed ${items.length} as ghosted`,
              () => restoreStages(items.map((i) => ({ id: i.id, stage: i.stage, closeReason: i.closeReason })))
            )
          }
        >
          Close all as ghosted
        </Button>
      </div>
    </div>
  );
}

export function SavedRow({ item }: { item: ApplicationItem }) {
  return (
    <Row>
      <Link href={`/applications/${item.id}`} className="min-w-0 flex-1 hover:underline">
        <span className="font-medium">{item.companyName}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          {item.roleTitle} · saved {item.daysSince}d ago — apply or let it go
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => runAction(() => updateStage(item.id, "applied"), `Marked ${item.companyName} as applied`)}
        >
          I applied
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            runAction(
              () => updateStage(item.id, "closed", "withdrawn"),
              `Closed ${item.companyName}`,
              () => updateStage(item.id, item.stage, item.closeReason ?? undefined)
            )
          }
        >
          Close
        </Button>
        <SnoozeMenu onSnooze={(days) => snoozeApplication(item.id, days)} />
      </div>
    </Row>
  );
}
