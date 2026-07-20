import { requireUserId } from "@/lib/auth/server";
import * as store from "@/lib/store";

const COLUMNS = [
  "companyName",
  "roleTitle",
  "stage",
  "closeReason",
  "location",
  "salaryRange",
  "source",
  "appliedDate",
  "interviewDate",
  "followUpOn",
  "jobUrl",
  "notes",
  "createdAt",
] as const;

function cell(value: string | null) {
  return `"${(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  const userId = await requireUserId();
  const applications = await store.listApplications(userId);
  const csv = [
    COLUMNS.join(","),
    ...applications.map((a) => COLUMNS.map((c) => cell(a[c])).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="backlog-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
