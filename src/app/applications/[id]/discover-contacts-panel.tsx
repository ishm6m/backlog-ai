"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { discoverContacts, addDiscoveredContact } from "@/app/applications/actions";
import { Button } from "@/components/ui/button";
import type { ContactCandidate } from "@/lib/discover-contacts";

export function DiscoverContactsPanel({
  applicationId,
  companyName,
}: {
  applicationId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ContactCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedLinks, setAddedLinks] = useState<Set<string>>(new Set());
  const [addingLink, setAddingLink] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    const result = await discoverContacts(companyName);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCandidates(result);
    if (result.length === 0) toast.info("No LinkedIn profiles found for that company.");
  }

  async function handleAdd(candidate: ContactCandidate) {
    setAddingLink(candidate.linkedinUrl);
    await addDiscoveredContact(applicationId, candidate.name, candidate.role, candidate.linkedinUrl);
    setAddingLink(null);
    setAddedLinks((prev) => new Set(prev).add(candidate.linkedinUrl));
    router.refresh();
    toast.success(`Added ${candidate.name}`);
  }

  return (
    <div className="mb-4">
      <Button type="button" variant="ghost" size="sm" onClick={handleSearch} disabled={loading}>
        {loading ? "Searching…" : "Find contacts"}
      </Button>

      {candidates && candidates.length > 0 && (
        <div className="mt-3 space-y-2">
          {candidates.map((c) => (
            <div
              key={c.linkedinUrl}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
            >
              <div>
                <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                  {c.name}
                </a>
                {c.role && <span className="ml-2 text-sm text-muted-foreground">{c.role}</span>}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={addedLinks.has(c.linkedinUrl) || addingLink === c.linkedinUrl}
                onClick={() => handleAdd(c)}
              >
                {addedLinks.has(c.linkedinUrl)
                  ? "Added"
                  : addingLink === c.linkedinUrl
                    ? "Adding…"
                    : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
