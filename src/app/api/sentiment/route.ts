import { parseSentiment } from "@/lib/market/sentiment";

export async function GET() {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=0", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`Sentiment provider returned ${response.status}`);
    return Response.json({ points: parseSentiment(await response.json()) });
  } catch {
    return Response.json({ error: "Fear & Greed data is temporarily unavailable." }, { status: 502 });
  }
}
