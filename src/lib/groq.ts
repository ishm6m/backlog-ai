import "server-only";
import { SOURCES, type Source } from "./types";

async function chat(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

export async function tailorResume(baseResume: string, jobDescription: string): Promise<string> {
  return chat(
    "You tailor resumes for ATS systems. Rewrite and reorder the given resume to mirror the target job description's language and prioritized skills. Keep every claim truthful — never invent experience, employers, or skills that aren't in the original resume. Use plain structured text only: no tables, columns, or graphics. Output only the tailored resume text, no commentary.",
    `JOB DESCRIPTION:\n${jobDescription.slice(0, 8000)}\n\nBASE RESUME:\n${baseResume.slice(0, 8000)}`
  );
}

export type ExtractedJob = {
  companyName: string;
  roleTitle: string;
  location: string;
  salaryRange: string;
  source: Source;
  jobDescription: string;
};

export async function extractJobDetails(text: string): Promise<ExtractedJob> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Extract job posting details as JSON with keys: companyName, roleTitle, location, salaryRange, source, jobDescription. source must be exactly one of: ${SOURCES.join(", ")} (use "Other" if unclear). jobDescription is the cleaned full posting text, minus site chrome. Use "" for any field you can't determine.`,
        },
        { role: "user", content: text.slice(0, 12000) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");

  const parsed = JSON.parse(content);
  return {
    companyName: typeof parsed.companyName === "string" ? parsed.companyName : "",
    roleTitle: typeof parsed.roleTitle === "string" ? parsed.roleTitle : "",
    location: typeof parsed.location === "string" ? parsed.location : "",
    salaryRange: typeof parsed.salaryRange === "string" ? parsed.salaryRange : "",
    source: SOURCES.includes(parsed.source) ? parsed.source : "Other",
    jobDescription: typeof parsed.jobDescription === "string" ? parsed.jobDescription : text,
  };
}
