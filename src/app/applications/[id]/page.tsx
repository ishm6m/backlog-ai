import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  FolderPlus,
  Send,
  Sparkles,
  UserPlus,
  ArrowRightLeft,
  Circle,
} from "lucide-react";
import { getApplication, getBaseResume, listContacts, listCustomProjects, listDocuments, listActivity } from "@/lib/store";
import { requireUserId } from "@/lib/auth/server";
import { StageMenu } from "@/components/stage-menu";
import { InlineField, InlineTextarea } from "@/components/inline-field";
import { OutreachStatusBadge, ProjectStatusBadge } from "@/components/status-badge";
import { ContactDialog } from "./contact-dialog";
import { MessagedButton } from "./messaged-button";
import { DiscoverContactsPanel } from "./discover-contacts-panel";
import { ProjectDialog } from "./project-dialog";
import { ResumePanel } from "./resume-panel";
import { SourceSelect } from "./source-select";
import { DeleteApplicationButton } from "./delete-application-button";

const ACTIVITY_ICONS: Record<string, typeof Circle> = {
  created: Sparkles,
  stage_change: ArrowRightLeft,
  contact_added: UserPlus,
  contact_updated: UserPlus,
  contact_removed: UserPlus,
  outreach_sent: Send,
  project_added: FolderPlus,
  project_updated: FolderPlus,
  project_removed: FolderPlus,
  document_added: FileText,
};

export const dynamic = "force-dynamic";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const application = await getApplication(id, userId);
  if (!application) notFound();

  const [contacts, projects, documents, activity, baseResume] = await Promise.all([
    listContacts(id, userId),
    listCustomProjects(id, userId),
    listDocuments(id, userId),
    listActivity(id, userId),
    getBaseResume(userId),
  ]);
  const resumeDocs = documents.filter((d) => d.type === "resume");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pipeline
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <InlineField
              applicationId={id}
              name="roleTitle"
              value={application.roleTitle}
              placeholder="Role title"
              nullable={false}
              className="text-2xl font-semibold tracking-tight"
            />
            <StageMenu app={application} />
          </div>
          <InlineField
            applicationId={id}
            name="companyName"
            value={application.companyName}
            placeholder="Company"
            nullable={false}
            className="text-muted-foreground"
          />
        </div>
        <DeleteApplicationButton id={application.id} companyName={application.companyName} />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-4 py-3">
        <Fact label="Location">
          <InlineField applicationId={id} name="location" value={application.location} placeholder="add" />
        </Fact>
        <Fact label="Salary">
          <InlineField applicationId={id} name="salaryRange" value={application.salaryRange} placeholder="add" />
        </Fact>
        <Fact label="Source">
          <SourceSelect applicationId={id} value={application.source} />
        </Fact>
        <Fact label="Applied">
          <InlineField applicationId={id} name="appliedDate" value={application.appliedDate} placeholder="add" type="date" />
        </Fact>
        <Fact label="Interview">
          <InlineField applicationId={id} name="interviewDate" value={application.interviewDate} placeholder="add" type="date" />
          {application.interviewDate && (
            <a
              href={`/api/ics/${id}`}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              .ics
            </a>
          )}
        </Fact>
        <Fact label="Follow up">
          <InlineField applicationId={id} name="followUpOn" value={application.followUpOn} placeholder="add" type="date" />
        </Fact>
        <Fact label="URL">
          <InlineField applicationId={id} name="jobUrl" value={application.jobUrl} placeholder="add" type="url" className="max-w-48 truncate" />
        </Fact>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Contacts {contacts.length > 0 && `(${contacts.length})`}
            </h2>
            <ContactDialog applicationId={id} />
          </div>
          <DiscoverContactsPanel applicationId={id} companyName={application.companyName} />
          {contacts.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              No contacts yet — find someone to reach out to.
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-sm text-muted-foreground">{contact.role}</span>
                    </div>
                    <div className="mt-1">
                      <OutreachStatusBadge status={contact.outreachStatus} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {contact.outreachStatus === "not_contacted" && (
                      <MessagedButton
                        contactId={contact.id}
                        applicationId={id}
                        contactName={contact.name}
                      />
                    )}
                    <ContactDialog applicationId={id} contact={contact} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Notes</h2>
          <InlineTextarea
            applicationId={id}
            name="notes"
            value={application.notes}
            placeholder="Anything worth remembering — interviewers, gut feel, next steps"
          />
        </section>

        <details className="group rounded-xl border bg-card px-4 py-3" open={!!application.jobDescription}>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Job description
          </summary>
          <div className="mt-3">
            <InlineTextarea
              applicationId={id}
              name="jobDescription"
              value={application.jobDescription}
              placeholder="Paste the job description — needed for resume tailoring"
              rows={8}
              nullable
            />
          </div>
        </details>

        <details className="rounded-xl border bg-card px-4 py-3" open={resumeDocs.length > 0}>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Resume {resumeDocs.length > 0 && `(${resumeDocs.length} version${resumeDocs.length > 1 ? "s" : ""})`}
          </summary>
          <div className="mt-4">
            <ResumePanel
              applicationId={id}
              jobDescription={application.jobDescription}
              documents={resumeDocs}
              initialBaseResume={baseResume}
            />
          </div>
        </details>

        <details className="rounded-xl border bg-card px-4 py-3" open={projects.length > 0}>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Projects {projects.length > 0 && `(${projects.length})`}
          </summary>
          <div className="mt-4">
            <div className="mb-3 flex justify-end">
              <ProjectDialog applicationId={id} />
            </div>
            {projects.length === 0 ? (
              <p className="pb-2 text-center text-sm text-muted-foreground">
                No custom projects yet.
              </p>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                  >
                    <div>
                      <span className="font-medium">{project.title}</span>
                      <span className="ml-2">
                        <ProjectStatusBadge status={project.status} />
                      </span>
                    </div>
                    <ProjectDialog applicationId={id} project={project} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>

        <details className="rounded-xl border bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Activity {activity.length > 0 && `(${activity.length})`}
          </summary>
          <div className="mt-4">
            {activity.length === 0 ? (
              <p className="pb-2 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ol className="space-y-3 pb-2">
                {activity.map((entry) => {
                  const Icon = ACTIVITY_ICONS[entry.eventType] ?? Circle;
                  return (
                    <li key={entry.id} className="flex items-start gap-3 text-sm">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <span>{entry.eventDescription}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
