import * as store from "@/lib/store";
import { sendEmail } from "@/lib/email";

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function section(title: string, lines: string[]) {
  if (lines.length === 0) return "";
  return `<p style="margin:20px 0 6px;font-size:13px;color:#71717a">${title}</p><ul style="margin:0;padding-left:18px">${lines
    .map((l) => `<li style="margin:4px 0">${escape(l)}</li>`)
    .join("")}</ul>`;
}

function buildDigest(data: Awaited<ReturnType<typeof store.getTodayData>>, appUrl: string) {
  const body = [
    section(
      "Interviews",
      data.interviews.map(
        (i) =>
          `${i.companyName} — ${i.roleTitle}, ${i.daysSince === 0 ? "today" : i.daysSince === 1 ? "tomorrow" : `in ${i.daysSince} days`}`
      )
    ),
    section(
      "Offers",
      data.offers.map(
        (i) =>
          `${i.companyName} — ${i.roleTitle}${
            i.daysSince === null
              ? ""
              : i.daysSince < 0
                ? `, respond-by ${-i.daysSince}d overdue`
                : `, respond in ${i.daysSince}d`
          }`
      )
    ),
    section(
      "Follow-ups",
      data.followUps.map(
        (c) => `${c.name} at ${c.companyName} — messaged ${c.daysSinceSent}d ago, no reply`
      )
    ),
    section(
      "Going cold",
      data.goingCold.map((i) => `${i.companyName} — ${i.roleTitle}, applied ${i.daysSince}d ago`)
    ),
    section(
      "Saved, not applied",
      data.savedNotApplied.map((i) => `${i.companyName} — ${i.roleTitle}, saved ${i.daysSince}d ago`)
    ),
    data.deadApplications.length > 0
      ? section("Silent 30+ days", [
          `${data.deadApplications.length} application${data.deadApplications.length > 1 ? "s" : ""} — close them out`,
        ])
      : "",
  ].join("");

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;color:#18181b">
<p style="margin:0;font-size:16px;font-weight:600">Today</p>
${body}
<p style="margin:24px 0 0"><a href="${appUrl}" style="color:#18181b">Open Backlog</a></p>
</div>`;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const recipients = await store.listDigestRecipients();
  let sent = 0;

  // ponytail: sequential sends — fine for a handful of users, batch if the list grows
  for (const { userId, email } of recipients) {
    const data = await store.getTodayData(userId);
    const count =
      data.followUps.length +
      data.goingCold.length +
      data.savedNotApplied.length +
      data.interviews.length +
      data.offers.length +
      data.deadApplications.length;
    if (count === 0) continue;

    await sendEmail(
      email,
      `${count} thing${count > 1 ? "s" : ""} need you today`,
      buildDigest(data, appUrl)
    );
    sent++;
  }

  return Response.json({ recipients: recipients.length, sent });
}
