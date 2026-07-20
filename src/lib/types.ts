export const STAGES = ["saved", "applied", "interviewing", "offer", "closed"] as const;
export type Stage = (typeof STAGES)[number];

export const CLOSE_REASONS = ["rejected", "ghosted", "withdrawn", "accepted"] as const;
export type CloseReason = (typeof CLOSE_REASONS)[number];

export const SOURCES = ["LinkedIn", "Company site", "Referral", "Other"] as const;
export type Source = (typeof SOURCES)[number];

export const OUTREACH_STATUSES = [
  "not_contacted",
  "message_sent",
  "replied",
  "no_response",
] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const OUTREACH_CHANNELS = ["LinkedIn", "Email", "Twitter", "Other"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const PROJECT_STATUSES = [
  "idea",
  "in_progress",
  "sent",
  "viewed",
  "replied",
  "no_response",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Application = {
  id: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string | null;
  jobDescription: string | null;
  location: string | null;
  salaryRange: string | null;
  source: Source;
  stage: Stage;
  closeReason: CloseReason | null;
  appliedDate: string | null;
  interviewDate: string | null;
  followUpOn: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  stageChangedAt: string;
};

export type Contact = {
  id: string;
  applicationId: string;
  name: string;
  role: string;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  email: string | null;
  outreachStatus: OutreachStatus;
  outreachSentDate: string | null;
  repliedDate: string | null;
  followUpOn: string | null;
  outreachChannel: OutreachChannel | null;
  messageSent: string;
  createdAt: string;
};

export type CustomProject = {
  id: string;
  applicationId: string;
  title: string;
  description: string;
  projectUrl: string | null;
  status: ProjectStatus;
  sentDate: string | null;
  repliedDate: string | null;
  notes: string;
  createdAt: string;
};

export const DOCUMENT_TYPES = ["resume", "cover_letter"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type Document = {
  id: string;
  applicationId: string;
  type: DocumentType;
  content: string;
  versionLabel: string;
  createdAt: string;
};

export type ActivityLogEntry = {
  id: string;
  applicationId: string;
  eventType: string;
  eventDescription: string;
  createdAt: string;
};

export const STAGE_LABELS: Record<Stage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  closed: "Closed",
};

export const CLOSE_REASON_LABELS: Record<CloseReason, string> = {
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
  accepted: "Accepted offer",
};

export const OUTREACH_STATUS_LABELS: Record<OutreachStatus, string> = {
  not_contacted: "Not contacted",
  message_sent: "Message sent",
  replied: "Replied",
  no_response: "No response",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "Idea",
  in_progress: "In progress",
  sent: "Sent",
  viewed: "Viewed",
  replied: "Replied",
  no_response: "No response",
};
