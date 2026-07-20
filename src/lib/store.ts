import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Application, Contact, CustomProject, Document, ActivityLogEntry } from "./types";

const sql = neon(process.env.DATABASE_URL!);

function toApplication(r: any): Application {
  return {
    id: r.id,
    companyName: r.company_name,
    roleTitle: r.role_title,
    jobUrl: r.job_url,
    jobDescription: r.job_description,
    location: r.location,
    salaryRange: r.salary_range,
    source: r.source,
    stage: r.stage,
    closeReason: r.close_reason,
    appliedDate: r.applied_date,
    followUpOn: r.follow_up_on,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toContact(r: any): Contact {
  return {
    id: r.id,
    applicationId: r.application_id,
    name: r.name,
    role: r.role,
    linkedinUrl: r.linkedin_url,
    twitterUrl: r.twitter_url,
    email: r.email,
    outreachStatus: r.outreach_status,
    outreachSentDate: r.outreach_sent_date,
    repliedDate: r.replied_date,
    followUpOn: r.follow_up_on,
    outreachChannel: r.outreach_channel,
    messageSent: r.message_sent,
    createdAt: r.created_at,
  };
}

function toProject(r: any): CustomProject {
  return {
    id: r.id,
    applicationId: r.application_id,
    title: r.title,
    description: r.description,
    projectUrl: r.project_url,
    status: r.status,
    sentDate: r.sent_date,
    repliedDate: r.replied_date,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

function toDocument(r: any): Document {
  return {
    id: r.id,
    applicationId: r.application_id,
    type: r.type,
    content: r.content,
    versionLabel: r.version_label,
    createdAt: r.created_at,
  };
}

function toActivity(r: any): ActivityLogEntry {
  return {
    id: r.id,
    applicationId: r.application_id,
    eventType: r.event_type,
    eventDescription: r.event_description,
    createdAt: r.created_at,
  };
}

export async function logActivity(applicationId: string, eventType: string, eventDescription: string) {
  await sql`
    insert into activity_log (application_id, event_type, event_description)
    values (${applicationId}, ${eventType}, ${eventDescription})
  `;
}

// applications

export async function listApplications(userId: string): Promise<Application[]> {
  const rows = await sql`
    select * from applications where user_id = ${userId} order by updated_at desc
  `;
  return rows.map(toApplication);
}

export async function getApplication(id: string, userId: string): Promise<Application | undefined> {
  const rows = await sql`select * from applications where id = ${id} and user_id = ${userId}`;
  return rows[0] ? toApplication(rows[0]) : undefined;
}

export async function findDuplicateApplication(
  userId: string,
  companyName: string
): Promise<Application | undefined> {
  const rows = await sql`
    select * from applications
    where user_id = ${userId}
      and stage != 'closed'
      and lower(company_name) = lower(${companyName})
    limit 1
  `;
  return rows[0] ? toApplication(rows[0]) : undefined;
}

export async function createApplication(
  userId: string,
  input: Omit<Application, "id" | "createdAt" | "updatedAt">
): Promise<Application> {
  const rows = await sql`
    insert into applications
      (user_id, company_name, role_title, job_url, job_description, location, salary_range, source, stage, close_reason, applied_date, follow_up_on, notes)
    values
      (${userId}, ${input.companyName}, ${input.roleTitle}, ${input.jobUrl}, ${input.jobDescription}, ${input.location}, ${input.salaryRange}, ${input.source}, ${input.stage}, ${input.closeReason}, ${input.appliedDate}, ${input.followUpOn}, ${input.notes})
    returning *
  `;
  const app = toApplication(rows[0]);
  await logActivity(app.id, "created", `Added application for ${app.roleTitle} at ${app.companyName}`);
  return app;
}

export async function updateApplication(
  id: string,
  userId: string,
  input: Partial<Omit<Application, "id" | "createdAt" | "updatedAt">>
): Promise<Application | undefined> {
  const current = await getApplication(id, userId);
  if (!current) return undefined;
  const merged = { ...current, ...input };
  // Moving to applied stamps the date; leaving closed clears the reason.
  if (merged.stage === "applied" && current.stage !== "applied" && !merged.appliedDate) {
    merged.appliedDate = new Date().toISOString().slice(0, 10);
  }
  if (merged.stage !== "closed") {
    merged.closeReason = null;
  }
  const rows = await sql`
    update applications set
      company_name = ${merged.companyName},
      role_title = ${merged.roleTitle},
      job_url = ${merged.jobUrl},
      job_description = ${merged.jobDescription},
      location = ${merged.location},
      salary_range = ${merged.salaryRange},
      source = ${merged.source},
      stage = ${merged.stage},
      close_reason = ${merged.closeReason},
      applied_date = ${merged.appliedDate},
      follow_up_on = ${merged.followUpOn},
      notes = ${merged.notes},
      updated_at = now()
    where id = ${id} and user_id = ${userId}
    returning *
  `;
  if (input.stage && input.stage !== current.stage) {
    await logActivity(id, "stage_change", `Stage changed to ${input.stage}`);
  }
  return toApplication(rows[0]);
}

export async function deleteApplication(id: string, userId: string) {
  await sql`delete from applications where id = ${id} and user_id = ${userId}`;
}

// contacts

export async function listContacts(applicationId: string, userId: string): Promise<Contact[]> {
  const rows = await sql`
    select c.* from contacts c
    join applications a on a.id = c.application_id
    where c.application_id = ${applicationId} and a.user_id = ${userId}
    order by c.created_at desc
  `;
  return rows.map(toContact);
}

export async function createContact(
  userId: string,
  input: Omit<Contact, "id" | "createdAt">
): Promise<Contact> {
  const rows = await sql`
    insert into contacts
      (application_id, name, role, linkedin_url, twitter_url, email, outreach_status, outreach_sent_date, replied_date, follow_up_on, outreach_channel, message_sent)
    select ${input.applicationId}, ${input.name}, ${input.role}, ${input.linkedinUrl}, ${input.twitterUrl}, ${input.email}, ${input.outreachStatus}, ${input.outreachSentDate}, ${input.repliedDate}, ${input.followUpOn}, ${input.outreachChannel}, ${input.messageSent}
    where exists (select 1 from applications where id = ${input.applicationId} and user_id = ${userId})
    returning *
  `;
  const contact = toContact(rows[0]);
  await logActivity(contact.applicationId, "contact_added", `Added contact ${contact.name}`);
  return contact;
}

export async function updateContact(
  id: string,
  userId: string,
  input: Partial<Omit<Contact, "id" | "applicationId" | "createdAt">>
): Promise<Contact | undefined> {
  const rows = await sql`
    select c.* from contacts c
    join applications a on a.id = c.application_id
    where c.id = ${id} and a.user_id = ${userId}
  `;
  if (!rows[0]) return undefined;
  const current = toContact(rows[0]);
  const merged = { ...current, ...input };
  const updated = await sql`
    update contacts set
      name = ${merged.name},
      role = ${merged.role},
      linkedin_url = ${merged.linkedinUrl},
      twitter_url = ${merged.twitterUrl},
      email = ${merged.email},
      outreach_status = ${merged.outreachStatus},
      outreach_sent_date = ${merged.outreachSentDate},
      replied_date = ${merged.repliedDate},
      follow_up_on = ${merged.followUpOn},
      outreach_channel = ${merged.outreachChannel},
      message_sent = ${merged.messageSent}
    where id = ${id}
    returning *
  `;
  return toContact(updated[0]);
}

export async function deleteContact(id: string, userId: string) {
  const rows = await sql`
    delete from contacts
    where id = ${id}
      and application_id in (select id from applications where user_id = ${userId})
    returning application_id, name
  `;
  if (rows[0]) {
    await logActivity(rows[0].application_id, "contact_removed", `Removed contact ${rows[0].name}`);
  }
}

// custom projects

export async function listCustomProjects(applicationId: string, userId: string): Promise<CustomProject[]> {
  const rows = await sql`
    select p.* from custom_projects p
    join applications a on a.id = p.application_id
    where p.application_id = ${applicationId} and a.user_id = ${userId}
    order by p.created_at desc
  `;
  return rows.map(toProject);
}

export async function createCustomProject(
  userId: string,
  input: Omit<CustomProject, "id" | "createdAt">
): Promise<CustomProject> {
  const rows = await sql`
    insert into custom_projects
      (application_id, title, description, project_url, status, sent_date, replied_date, notes)
    select ${input.applicationId}, ${input.title}, ${input.description}, ${input.projectUrl}, ${input.status}, ${input.sentDate}, ${input.repliedDate}, ${input.notes}
    where exists (select 1 from applications where id = ${input.applicationId} and user_id = ${userId})
    returning *
  `;
  const project = toProject(rows[0]);
  await logActivity(project.applicationId, "project_added", `Added project "${project.title}"`);
  return project;
}

export async function updateCustomProject(
  id: string,
  userId: string,
  input: Partial<Omit<CustomProject, "id" | "applicationId" | "createdAt">>
): Promise<CustomProject | undefined> {
  const rows = await sql`
    select p.* from custom_projects p
    join applications a on a.id = p.application_id
    where p.id = ${id} and a.user_id = ${userId}
  `;
  if (!rows[0]) return undefined;
  const current = toProject(rows[0]);
  const merged = { ...current, ...input };
  const updated = await sql`
    update custom_projects set
      title = ${merged.title},
      description = ${merged.description},
      project_url = ${merged.projectUrl},
      status = ${merged.status},
      sent_date = ${merged.sentDate},
      replied_date = ${merged.repliedDate},
      notes = ${merged.notes}
    where id = ${id}
    returning *
  `;
  return toProject(updated[0]);
}

export async function deleteCustomProject(id: string, userId: string) {
  const rows = await sql`
    delete from custom_projects
    where id = ${id}
      and application_id in (select id from applications where user_id = ${userId})
    returning application_id, title
  `;
  if (rows[0]) {
    await logActivity(rows[0].application_id, "project_removed", `Removed project "${rows[0].title}"`);
  }
}

// documents

export async function listDocuments(applicationId: string, userId: string): Promise<Document[]> {
  const rows = await sql`
    select d.* from documents d
    join applications a on a.id = d.application_id
    where d.application_id = ${applicationId} and a.user_id = ${userId}
    order by d.created_at desc
  `;
  return rows.map(toDocument);
}

export async function createDocument(
  userId: string,
  input: Omit<Document, "id" | "createdAt">
): Promise<Document> {
  const rows = await sql`
    insert into documents (application_id, type, content, version_label)
    select ${input.applicationId}, ${input.type}, ${input.content}, ${input.versionLabel}
    where exists (select 1 from applications where id = ${input.applicationId} and user_id = ${userId})
    returning *
  `;
  const document = toDocument(rows[0]);
  await logActivity(document.applicationId, "document_added", `Saved ${document.type.replace("_", " ")} version "${document.versionLabel}"`);
  return document;
}

// activity log

export async function listActivity(applicationId: string, userId: string): Promise<ActivityLogEntry[]> {
  const rows = await sql`
    select l.* from activity_log l
    join applications a on a.id = l.application_id
    where l.application_id = ${applicationId} and a.user_id = ${userId}
    order by l.created_at desc
  `;
  return rows.map(toActivity);
}

// subscriptions

export type Plan = "free" | "pro";

export const PLAN_AI_LIMITS: Record<Plan, number> = { free: 20, pro: 200 };

export type Subscription = {
  plan: Plan;
  status: string;
  dodoCustomerId: string | null;
  dodoSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

export async function getSubscription(userId: string): Promise<Subscription> {
  const rows = await sql`select * from subscriptions where user_id = ${userId}`;
  const r = rows[0];
  if (!r) return { plan: "free", status: "free", dodoCustomerId: null, dodoSubscriptionId: null, currentPeriodEnd: null };
  return {
    plan: r.plan,
    status: r.status,
    dodoCustomerId: r.dodo_customer_id,
    dodoSubscriptionId: r.dodo_subscription_id,
    currentPeriodEnd: r.current_period_end,
  };
}

export async function upsertSubscription(
  userId: string,
  input: { dodoCustomerId: string; dodoSubscriptionId: string; plan: Plan; status: string; currentPeriodEnd: string | null }
) {
  await sql`
    insert into subscriptions (user_id, dodo_customer_id, dodo_subscription_id, plan, status, current_period_end, updated_at)
    values (${userId}, ${input.dodoCustomerId}, ${input.dodoSubscriptionId}, ${input.plan}, ${input.status}, ${input.currentPeriodEnd}, now())
    on conflict (user_id) do update set
      dodo_customer_id = excluded.dodo_customer_id,
      dodo_subscription_id = excluded.dodo_subscription_id,
      plan = excluded.plan,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      updated_at = now()
  `;
}

// user profile

export async function getBaseResume(userId: string): Promise<string> {
  const rows = await sql`select base_resume from user_profile where user_id = ${userId}`;
  return rows[0]?.base_resume ?? "";
}

export async function saveBaseResume(userId: string, content: string) {
  await sql`
    insert into user_profile (user_id, base_resume, updated_at)
    values (${userId}, ${content}, now())
    on conflict (user_id) do update set base_resume = excluded.base_resume, updated_at = now()
  `;
}

// AI usage rate limiting

export async function getAiUsageToday(userId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count from ai_usage_log
    where user_id = ${userId} and created_at > now() - interval '1 day'
  `;
  return rows[0].count;
}

export async function checkAndRecordAiUsage(userId: string): Promise<boolean> {
  const { plan } = await getSubscription(userId);
  const used = await getAiUsageToday(userId);
  if (used >= PLAN_AI_LIMITS[plan]) return false;
  await sql`insert into ai_usage_log (user_id) values (${userId})`;
  return true;
}

// today view — next-action engine
// ponytail: deterministic day thresholds (5/14/3) are constants, not settings

export type FollowUpItem = Contact & {
  companyName: string;
  roleTitle: string;
  daysSinceSent: number;
};
export type ApplicationItem = Application & { daysSince: number };

export async function getTodayData(userId: string) {
  const [summaryRows, followUpRows, coldRows, savedRows] = await Promise.all([
    sql`
      select
        count(*) filter (where stage != 'closed')::int as active,
        count(*) filter (where stage = 'interviewing')::int as interviewing,
        count(*) filter (where stage = 'offer')::int as offers,
        count(*)::int as total
      from applications where user_id = ${userId}
    `,
    sql`
      select c.*, a.company_name, a.role_title,
        (current_date - c.outreach_sent_date::date)::int as days_since_sent
      from contacts c
      join applications a on a.id = c.application_id
      where a.user_id = ${userId}
        and a.stage != 'closed'
        and c.outreach_status = 'message_sent'
        and c.replied_date is null
        and coalesce(c.follow_up_on, c.outreach_sent_date::date + 5) <= current_date
      order by c.outreach_sent_date asc
    `,
    sql`
      select *, (current_date - coalesce(applied_date::date, updated_at::date))::int as days_since
      from applications
      where user_id = ${userId}
        and stage = 'applied'
        and coalesce(follow_up_on, coalesce(applied_date::date, updated_at::date) + 14) <= current_date
      order by applied_date asc nulls last
    `,
    sql`
      select *, (current_date - created_at::date)::int as days_since
      from applications
      where user_id = ${userId}
        and stage = 'saved'
        and coalesce(follow_up_on, created_at::date + 3) <= current_date
      order by created_at asc
    `,
  ]);

  const s = summaryRows[0] as any;
  return {
    summary: { active: s.active, interviewing: s.interviewing, offers: s.offers, total: s.total },
    followUps: followUpRows.map((r: any): FollowUpItem => ({
      ...toContact(r),
      companyName: r.company_name,
      roleTitle: r.role_title,
      daysSinceSent: r.days_since_sent,
    })),
    goingCold: coldRows.map((r: any): ApplicationItem => ({ ...toApplication(r), daysSince: r.days_since })),
    savedNotApplied: savedRows.map((r: any): ApplicationItem => ({ ...toApplication(r), daysSince: r.days_since })),
  };
}
