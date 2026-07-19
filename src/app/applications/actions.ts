"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as store from "@/lib/store";
import { requireUserId } from "@/lib/auth/server";
import { extractJobDetails, tailorResume as tailorResumeWithGroq, type ExtractedJob } from "@/lib/groq";
import { discoverContacts as findContacts, type ContactCandidate } from "@/lib/discover-contacts";
import type { Source, Stage, OutreachStatus, OutreachChannel, ProjectStatus, DocumentType } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? "";
}

function nullableStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v === "" ? null : v;
}

export async function extractJobPosting(text: string): Promise<ExtractedJob | { error: string }> {
  const userId = await requireUserId();
  if (!(await store.checkAndRecordAiUsage(userId))) {
    return { error: "Daily AI usage limit reached — try again tomorrow." };
  }
  try {
    return await extractJobDetails(text);
  } catch {
    return { error: "Couldn't extract details from that — fill in the fields manually." };
  }
}

export async function createApplication(formData: FormData) {
  const userId = await requireUserId();
  const app = await store.createApplication(userId, {
    companyName: str(formData, "companyName"),
    roleTitle: str(formData, "roleTitle"),
    jobUrl: nullableStr(formData, "jobUrl"),
    jobDescription: nullableStr(formData, "jobDescription"),
    location: nullableStr(formData, "location"),
    salaryRange: nullableStr(formData, "salaryRange"),
    source: str(formData, "source") as Source,
    stage: str(formData, "stage") as Stage,
    appliedDate: nullableStr(formData, "appliedDate"),
    notes: str(formData, "notes"),
  });
  revalidatePath("/applications");
  redirect(`/applications/${app.id}`);
}

export async function updateApplication(id: string, formData: FormData) {
  const userId = await requireUserId();
  await store.updateApplication(id, userId, {
    companyName: str(formData, "companyName"),
    roleTitle: str(formData, "roleTitle"),
    jobUrl: nullableStr(formData, "jobUrl"),
    jobDescription: nullableStr(formData, "jobDescription"),
    location: nullableStr(formData, "location"),
    salaryRange: nullableStr(formData, "salaryRange"),
    source: str(formData, "source") as Source,
    stage: str(formData, "stage") as Stage,
    appliedDate: nullableStr(formData, "appliedDate"),
    notes: str(formData, "notes"),
  });
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function updateStage(id: string, stage: Stage) {
  const userId = await requireUserId();
  await store.updateApplication(id, userId, { stage });
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();
  await store.deleteApplication(id, userId);
  revalidatePath("/applications");
  redirect("/applications");
}

export async function discoverContacts(companyName: string): Promise<ContactCandidate[] | { error: string }> {
  const userId = await requireUserId();
  if (!(await store.checkAndRecordAiUsage(userId))) {
    return { error: "Daily AI usage limit reached — try again tomorrow." };
  }
  try {
    return await findContacts(companyName);
  } catch {
    return { error: "Couldn't search for contacts — try again in a moment." };
  }
}

export async function addDiscoveredContact(
  applicationId: string,
  name: string,
  role: string,
  linkedinUrl: string
) {
  const userId = await requireUserId();
  await store.createContact(userId, {
    applicationId,
    name,
    role,
    linkedinUrl,
    twitterUrl: null,
    email: null,
    outreachStatus: "not_contacted",
    outreachSentDate: null,
    repliedDate: null,
    outreachChannel: null,
    messageSent: "",
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function tailorResume(
  jobDescription: string,
  baseResume: string
): Promise<string | { error: string }> {
  const userId = await requireUserId();
  if (!(await store.checkAndRecordAiUsage(userId))) {
    return { error: "Daily AI usage limit reached — try again tomorrow." };
  }
  try {
    return await tailorResumeWithGroq(baseResume, jobDescription);
  } catch {
    return { error: "Couldn't generate a tailored resume — try again in a moment." };
  }
}

export async function saveDocument(
  applicationId: string,
  type: DocumentType,
  content: string,
  versionLabel: string
) {
  const userId = await requireUserId();
  await store.createDocument(userId, { applicationId, type, content, versionLabel: versionLabel || "Untitled" });
  revalidatePath(`/applications/${applicationId}`);
}

export async function createContact(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  await store.createContact(userId, {
    applicationId,
    name: str(formData, "name"),
    role: str(formData, "role"),
    linkedinUrl: nullableStr(formData, "linkedinUrl"),
    twitterUrl: nullableStr(formData, "twitterUrl"),
    email: nullableStr(formData, "email"),
    outreachStatus: (str(formData, "outreachStatus") || "not_contacted") as OutreachStatus,
    outreachSentDate: nullableStr(formData, "outreachSentDate"),
    repliedDate: nullableStr(formData, "repliedDate"),
    outreachChannel: nullableStr(formData, "outreachChannel") as OutreachChannel | null,
    messageSent: str(formData, "messageSent"),
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function updateContact(id: string, applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  await store.updateContact(id, userId, {
    name: str(formData, "name"),
    role: str(formData, "role"),
    linkedinUrl: nullableStr(formData, "linkedinUrl"),
    twitterUrl: nullableStr(formData, "twitterUrl"),
    email: nullableStr(formData, "email"),
    outreachStatus: str(formData, "outreachStatus") as OutreachStatus,
    outreachSentDate: nullableStr(formData, "outreachSentDate"),
    repliedDate: nullableStr(formData, "repliedDate"),
    outreachChannel: nullableStr(formData, "outreachChannel") as OutreachChannel | null,
    messageSent: str(formData, "messageSent"),
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function deleteContact(id: string, applicationId: string) {
  const userId = await requireUserId();
  await store.deleteContact(id, userId);
  revalidatePath(`/applications/${applicationId}`);
}

export async function createCustomProject(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  await store.createCustomProject(userId, {
    applicationId,
    title: str(formData, "title"),
    description: str(formData, "description"),
    projectUrl: nullableStr(formData, "projectUrl"),
    status: (str(formData, "status") || "idea") as ProjectStatus,
    sentDate: nullableStr(formData, "sentDate"),
    repliedDate: nullableStr(formData, "repliedDate"),
    notes: str(formData, "notes"),
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function updateCustomProject(id: string, applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  await store.updateCustomProject(id, userId, {
    title: str(formData, "title"),
    description: str(formData, "description"),
    projectUrl: nullableStr(formData, "projectUrl"),
    status: str(formData, "status") as ProjectStatus,
    sentDate: nullableStr(formData, "sentDate"),
    repliedDate: nullableStr(formData, "repliedDate"),
    notes: str(formData, "notes"),
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function deleteCustomProject(id: string, applicationId: string) {
  const userId = await requireUserId();
  await store.deleteCustomProject(id, userId);
  revalidatePath(`/applications/${applicationId}`);
}
