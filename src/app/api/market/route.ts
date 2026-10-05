import {getAvailableMarkets, getCandles, getMarkets} from "@/lib/market/binance";
import {INTERVALS, type Interval} from "@/lib/market/types";

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const symbol = params.get("symbol") ?? "BTCUSDT";
    const interval = params.get("interval") ?? "24h";
    if (!/^[A-Z0-9]{2,30}USDT$/.test(symbol) || !INTERVALS.some((value) => value === interval)) {
        return Response.json({error: "Unsupported symbol or interval."}, {status: 400});
    }
    try {
        const available = await getAvailableMarkets();
        if (!available.some((market) => market.symbol === symbol)) return Response.json({error: "Unsupported symbol."}, {status: 400});
        const [ranked, candles] = await Promise.all([getMarkets(available), getCandles(symbol, interval as Interval)]);
        if (!ranked.length) throw new Error("No active markets available");
        const top = ranked.slice(0, 80);
        const definitions = new Map(available.map((market) => [market.symbol, market]));
        const catalog = top.map((market) => definitions.get(market.symbol)!);
        const selected = ranked.find((market) => market.symbol === symbol);
        const markets = selected && !top.some((market) => market.symbol === symbol) ? [...top, selected] : top;
        const closeTime = Math.max(...markets.map((market) => market.closeTime));
        return Response.json({
            markets,
            catalog,
            candles,
            symbol,
            interval,
            updatedAt: new Date(closeTime).toISOString(),
            source: "Binance Spot"
        }, {headers: {"Cache-Control": "no-store"}});
    } catch (error) {
        console.error("Market data request failed:", error instanceof Error ? error.message : "Unknown error");
        return Response.json({error: "Market data is temporarily unavailable. Please try again."}, {
            status: 502,
            headers: {"Cache-Control": "no-store"}
        });
    }
}
