import { CHART_RANGES, MARKETS, type Candle, type Interval, type Market, type MarketDefinition } from "./types";

const BASE_URL = "https://data-api.binance.vision/api/v3";

async function request(path: string, params: Record<string, string>, revalidate = 0): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/${path}?${new URLSearchParams(params)}`, {
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Market provider returned ${response.status}`);
  return response.json();
}
function numeric(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") throw new Error("Invalid market value");
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error("Invalid market value");
  return result;
}
const STABLE_ASSETS = new Set(["USDC", "FDUSD", "TUSD", "USDP", "DAI", "USDD", "USDE", "USD1", "BUSD", "AEUR", "EURI", "EUR", "PAX", "USTC"]);
const ASSET_NAMES: Record<string, string> = {
  ...Object.fromEntries(MARKETS.map((market) => [market.asset, market.name])),
  BCH: "Bitcoin Cash", TRX: "TRON", TON: "Toncoin", SHIB: "Shiba Inu", NEAR: "NEAR Protocol", UNI: "Uniswap", AAVE: "Aave",
  HBAR: "Hedera", ICP: "Internet Computer", ETC: "Ethereum Classic", FIL: "Filecoin", ATOM: "Cosmos", XLM: "Stellar", ALGO: "Algorand",
  ARB: "Arbitrum", OP: "Optimism", POL: "Polygon", APT: "Aptos", INJ: "Injective", RENDER: "Render", FET: "Artificial Superintelligence Alliance",
  PEPE: "Pepe", WIF: "dogwifhat", BONK: "Bonk", FLOKI: "Floki", SEI: "Sei", TIA: "Celestia", ONDO: "Ondo", ENA: "Ethena",
  TAO: "Bittensor", WLD: "Worldcoin", JUP: "Jupiter", JTO: "Jito", RUNE: "THORChain", LDO: "Lido DAO", CRV: "Curve DAO",
  GRT: "The Graph", QNT: "Quant", IMX: "Immutable", SAND: "The Sandbox", MANA: "Decentraland", AXS: "Axie Infinity",
  EOS: "EOS", VET: "VeChain", THETA: "Theta Network", NEO: "NEO", IOTA: "IOTA", HYPE: "Hyperliquid", PENGU: "Pudgy Penguins",
};

export async function getAvailableMarkets(): Promise<MarketDefinition[]> {
  const raw = await request("exchangeInfo", {}, 300);
  if (!raw || typeof raw !== "object" || !("symbols" in raw) || !Array.isArray(raw.symbols)) throw new Error("Invalid exchange response");
  return raw.symbols.filter((row) => row && row.status === "TRADING" && row.quoteAsset === "USDT" && row.isSpotTradingAllowed !== false && typeof row.symbol === "string" && typeof row.baseAsset === "string" && !STABLE_ASSETS.has(row.baseAsset)).map((row) => ({ symbol: row.symbol, asset: row.baseAsset, name: ASSET_NAMES[row.baseAsset] ?? row.baseAsset }));
}

export async function getMarkets(available: MarketDefinition[]): Promise<Market[]> {
  const raw = await request("ticker/24hr", {}, 60);
  if (!Array.isArray(raw) || !raw.length) throw new Error("Incomplete market response");
  const symbols = new Set(available.map((market) => market.symbol));
  return raw.filter((row) => row && typeof row === "object" && symbols.has(row.symbol)).map((row) => {
    return { symbol: row.symbol, price: numeric(row.lastPrice), change: numeric(row.priceChangePercent), high: numeric(row.highPrice), low: numeric(row.lowPrice), volume: numeric(row.volume), quoteVolume: numeric(row.quoteVolume), closeTime: numeric(row.closeTime) };
  }).filter((market) => market.price > 0 && market.quoteVolume > 0).sort((a, b) => b.quoteVolume - a.quoteVolume || a.symbol.localeCompare(b.symbol));
}
export async function getCandles(symbol: string, interval: Interval): Promise<Candle[]> {
  const range = CHART_RANGES[interval];
  const limit = Math.max(240, range.duration / range.candleDuration * 2);
  let raw: unknown;
  if (interval === "all") {
    const history: unknown[] = [];
    let startTime = 0;
    while (true) {
      const page = await request("klines", { symbol, interval: range.candleInterval, limit: "1000", startTime: String(startTime) });
      if (!Array.isArray(page)) throw new Error("Invalid candle response");
      history.push(...page);
      if (page.length < 1000) break;
      const lastRow = page[page.length - 1];
      if (!Array.isArray(lastRow)) throw new Error("Invalid candle response");
      const nextTime = numeric(lastRow[0]) + range.candleDuration;
      if (nextTime <= startTime) throw new Error("Market history did not advance");
      startTime = nextTime;
    }
    raw = history;
  } else {
    raw = await request("klines", { symbol, interval: range.candleInterval, limit: String(limit) });
  }
  if (!Array.isArray(raw) || !raw.length) throw new Error("Empty candle response");
  return raw.map((row) => {
    if (!Array.isArray(row) || row.length < 6) throw new Error("Invalid candle response");
    const candle = { time: numeric(row[0]), open: numeric(row[1]), high: numeric(row[2]), low: numeric(row[3]), close: numeric(row[4]), volume: numeric(row[5]) };
    if (candle.low > Math.min(candle.open, candle.close) || candle.high < Math.max(candle.open, candle.close)) throw new Error("Invalid candle range");
    return candle;
  });
}
