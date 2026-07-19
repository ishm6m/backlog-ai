import Link from "next/link";
import { listApplications } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PipelineTable } from "./pipeline-table";
import { requireUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const userId = await requireUserId();
  const applications = await listApplications(userId);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} application{applications.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link href="/applications/new" />} nativeButton={false}>
          New application
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <p className="text-sm text-muted-foreground">No applications yet.</p>
          <Button
            render={<Link href="/applications/new" />}
            nativeButton={false}
            variant="outline"
            className="mt-4"
          >
            Add your first application
          </Button>
        </div>
      ) : (
        <PipelineTable applications={applications} />
      )}
    </div>
  );
}
