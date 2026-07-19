import "server-only";

type SerperResult = { title: string; link: string; snippet?: string };

export async function searchWeb(query: string): Promise<SerperResult[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query }),
  });

  if (!res.ok) {
    throw new Error(`Serper request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.organic ?? [];
}
