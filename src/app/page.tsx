import Link from "next/link";
import { getDashboardData } from "@/lib/store";
import { STAGES, STAGE_LABELS } from "@/lib/types";
import { StageBadge } from "@/components/stage-badge";
import { requireUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const { stageCounts, staleApplications, pendingOutreach } = await getDashboardData(userId);
  const activeStages = STAGES.filter((s) => s !== "rejected" && s !== "ghosted" && s !== "withdrawn");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Dashboard</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Pipeline funnel</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {activeStages.map((stage) => (
            <div key={stage} className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-semibold tracking-tight">{stageCounts[stage] ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">{STAGE_LABELS[stage]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-medium text-muted-foreground">Needs attention today</h2>
        {staleApplications.length === 0 && pendingOutreach.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nothing needs attention right now.
          </div>
        ) : (
          <>
            {staleApplications.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Stale applications ({staleApplications.length})
                </h3>
                {staleApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <div>
                      <span className="font-medium">{app.roleTitle}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{app.companyName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        No update in {app.daysSinceUpdate} days
                      </span>
                      <StageBadge stage={app.stage} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {pendingOutreach.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Pending outreach ({pendingOutreach.length})
                </h3>
                {pendingOutreach.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/applications/${contact.applicationId}`}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <div>
                      <span className="font-medium">{contact.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {contact.roleTitle} at {contact.companyName}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      No reply in {contact.daysSinceSent} days
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
