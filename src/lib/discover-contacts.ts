import "server-only";
import { searchWeb } from "./serper";

export type ContactCandidate = {
  name: string;
  role: string;
  linkedinUrl: string;
};

export async function discoverContacts(companyName: string): Promise<ContactCandidate[]> {
  const query = `site:linkedin.com/in "${companyName}" (recruiter OR "talent acquisition" OR "hiring manager" OR engineer)`;
  const results = await searchWeb(query);

  const candidates: ContactCandidate[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (!r.link.includes("linkedin.com/in/") || seen.has(r.link)) continue;
    const title = r.title.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
    const [name, ...rest] = title.split(" - ");
    if (!name) continue;
    seen.add(r.link);
    candidates.push({ name: name.trim(), role: rest.join(" - ").trim(), linkedinUrl: r.link });
  }

  return candidates.slice(0, 8);
}
