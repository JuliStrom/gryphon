export type SentimentPoint = { time: number; value: number; classification: string };

export function parseSentiment(payload: unknown): SentimentPoint[] {
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data) || !payload.data.length) throw new Error("Empty sentiment response");
  return payload.data.map((row: unknown) => {
    if (!row || typeof row !== "object" || !("value" in row) || !("timestamp" in row) || !("value_classification" in row)) throw new Error("Invalid sentiment response");
    const value = Number(row.value), time = Number(row.timestamp) * 1000;
    if (!Number.isFinite(value) || value < 0 || value > 100 || !Number.isFinite(time) || time <= 0 || typeof row.value_classification !== "string") throw new Error("Invalid sentiment value");
    return { time, value, classification: row.value_classification };
  }).sort((a, b) => a.time - b.time);
}
