import { getAvailableMarkets, getMarkets } from "@/lib/market/binance";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("symbols");
  const symbols = requested ? [...new Set(requested.split(","))] : null;
  if (symbols && (symbols.length > 200 || symbols.some((symbol) => !/^[A-Z0-9]{2,30}USDT$/.test(symbol)))) return Response.json({ error: "Unsupported symbols." }, { status: 400 });
  try {
    const available = await getAvailableMarkets();
    const all = await getMarkets(available);
    if (!all.length) throw new Error("No markets available");
    const ranked = symbols ? all.filter((market) => symbols.includes(market.symbol)) : all.slice(0, 80);
    const definitions = new Map(available.map((market) => [market.symbol, market]));
    return Response.json({ markets: ranked.map((market) => ({ ...definitions.get(market.symbol)!, ...market })) });
  } catch {
    return Response.json({ error: "Market prices are temporarily unavailable." }, { status: 502 });
  }
}
