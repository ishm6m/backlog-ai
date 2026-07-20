import { requireUserId } from "@/lib/auth/server";
import * as store from "@/lib/store";

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

function day(date: string) {
  return date.slice(0, 10).replace(/-/g, "");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const app = await store.getApplication(id, userId);
  if (!app?.interviewDate) {
    return new Response("No interview date set for this application.", { status: 404 });
  }

  const next = new Date(app.interviewDate.slice(0, 10));
  next.setDate(next.getDate() + 1);

  // all-day event — we only store a date, not a time
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Backlog AI//EN",
    "BEGIN:VEVENT",
    `UID:${app.id}@backlog-ai`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;VALUE=DATE:${day(app.interviewDate)}`,
    `DTEND;VALUE=DATE:${day(next.toISOString())}`,
    `SUMMARY:Interview: ${app.companyName} — ${app.roleTitle}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="interview-${app.companyName.toLowerCase().replace(/\W+/g, "-")}.ics"`,
    },
  });
}
