import Link from "next/link";
import { getTodayData } from "@/lib/store";
import { requireUserId } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { ColdRow, FollowUpRow, SavedRow } from "./today-rows";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const userId = await requireUserId();
  const { summary, followUps, goingCold, savedNotApplied } = await getTodayData(userId);
  const nothingDue = followUps.length === 0 && goingCold.length === 0 && savedNotApplied.length === 0;

  const summaryParts = [`${summary.active} active`];
  if (summary.interviewing > 0) summaryParts.push(`${summary.interviewing} interviewing`);
  if (summary.offers > 0) summaryParts.push(`${summary.offers} offer${summary.offers > 1 ? "s" : ""}`);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground">{summaryParts.join(" · ")}</p>
      </div>

      {summary.total === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Your pipeline is empty. Add your first application to start.
          </p>
          <Button render={<Link href="/applications/new" />} nativeButton={false}>
            Add an application
          </Button>
        </div>
      ) : nothingDue ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          All clear — nothing needs you today.
        </div>
      ) : (
        <div className="space-y-8">
          {followUps.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                Follow-ups ({followUps.length})
              </h2>
              {followUps.map((item) => (
                <FollowUpRow key={item.id} item={item} />
              ))}
            </section>
          )}
          {goingCold.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                Going cold ({goingCold.length})
              </h2>
              {goingCold.map((item) => (
                <ColdRow key={item.id} item={item} />
              ))}
            </section>
          )}
          {savedNotApplied.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                Saved, not applied ({savedNotApplied.length})
              </h2>
              {savedNotApplied.map((item) => (
                <SavedRow key={item.id} item={item} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
