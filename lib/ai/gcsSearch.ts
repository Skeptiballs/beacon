type GcsResult = {
  title: string;
  link: string;
  snippet?: string;
};

const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-z0-9\-\._/]+/i;

export async function searchLinkedInWithGCS(query: string): Promise<string | undefined> {
  const apiKey = process.env.GCS_API_KEY;
  const cx = process.env.GCS_CX;
  if (!apiKey || !cx) return undefined;

  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
  });

  const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
  if (!res.ok) return undefined;

  const json = (await res.json()) as { items?: GcsResult[] };
  const items = json.items || [];

  for (const item of items) {
    if (LINKEDIN_REGEX.test(item.link)) {
      return item.link;
    }
  }

  return undefined;
}






