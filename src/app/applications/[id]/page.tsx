import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  FolderKanban,
  FolderPlus,
  History,
  Info,
  Sparkles,
  UserPlus,
  Users,
  ArrowRightLeft,
  Circle,
} from "lucide-react";
import { getApplication, listContacts, listCustomProjects, listDocuments, listActivity } from "@/lib/store";
import { requireUserId } from "@/lib/auth/server";
import { StageBadge } from "@/components/stage-badge";
import { OutreachStatusBadge, ProjectStatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationForm } from "./application-form";
import { ContactDialog } from "./contact-dialog";
import { DiscoverContactsPanel } from "./discover-contacts-panel";
import { ProjectDialog } from "./project-dialog";
import { ResumePanel } from "./resume-panel";
import { DeleteApplicationButton } from "./delete-application-button";

const ACTIVITY_ICONS: Record<string, typeof Circle> = {
  created: Sparkles,
  stage_change: ArrowRightLeft,
  contact_added: UserPlus,
  project_added: FolderPlus,
  document_added: FileText,
};

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const application = await getApplication(id, userId);
  if (!application) notFound();

  const [contacts, projects, documents, activity] = await Promise.all([
    listContacts(id, userId),
    listCustomProjects(id, userId),
    listDocuments(id, userId),
    listActivity(id, userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pipeline
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{application.roleTitle}</h1>
            <StageBadge stage={application.stage} closeReason={application.closeReason} />
          </div>
          <p className="text-sm text-muted-foreground">{application.companyName}</p>
        </div>
        <DeleteApplicationButton id={application.id} companyName={application.companyName} />
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">
            <Info /> Details
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users /> Contacts{contacts.length > 0 && ` (${contacts.length})`}
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban /> Projects{projects.length > 0 && ` (${projects.length})`}
          </TabsTrigger>
          <TabsTrigger value="resume">
            <FileText /> Resume
          </TabsTrigger>
          <TabsTrigger value="activity">
            <History /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <section className="rounded-xl border bg-card p-6">
            <ApplicationForm application={application} />
          </section>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Contacts {contacts.length > 0 && `(${contacts.length})`}
              </h2>
              <ContactDialog applicationId={id} />
            </div>
            <DiscoverContactsPanel applicationId={id} companyName={application.companyName} />
            {contacts.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                No contacts yet.
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
                    <ContactDialog applicationId={id} contact={contact} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Custom projects {projects.length > 0 && `(${projects.length})`}
              </h2>
              <ProjectDialog applicationId={id} />
            </div>
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                No custom projects yet.
              </div>
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
          </section>
        </TabsContent>

        <TabsContent value="resume" className="mt-6">
          <section>
            <ResumePanel
              applicationId={id}
              jobDescription={application.jobDescription}
              documents={documents.filter((d) => d.type === "resume")}
            />
          </section>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <section>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ol className="space-y-3">
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
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
