import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Module from "node:module";
import ts from "typescript";
import { QueryClient, QueryObserver } from "@tanstack/react-query";

const filename = fileURLToPath(new URL("../src/lib/market/market-query.ts", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const queryModule = new Module(filename);
queryModule.filename = filename;
queryModule.paths = Module._nodeModulePaths(path.dirname(filename));
queryModule._compile(compiled, filename);
const { marketQueryOptions, MARKET_REFRESH_MS } = queryModule.exports;

function setup(t) {
  const client = new QueryClient();
  const originalFetch = global.fetch;
  const requests = [];
  const observers = [];
  global.fetch = async (url) => {
    requests.push(url);
    const params = new URL(url, "http://localhost").searchParams;
    return { ok: true, json: async () => ({ symbol: params.get("symbol"), interval: params.get("interval"), candles: [], markets: [], catalog: [], updatedAt: new Date().toISOString() }) };
  };
  t.after(() => { observers.forEach((observer) => observer.destroy()); client.clear(); global.fetch = originalFetch; });
  return { client, requests, observers };
}

test("BTC -> ETH -> BTC reuses the fresh BTC response without another request", async (t) => {
  const { client, requests } = setup(t);
  const btc = marketQueryOptions("BTCUSDT", "24h");
  const first = await client.fetchQuery(btc);
  await client.fetchQuery(marketQueryOptions("ETHUSDT", "24h"));
  assert.equal(await client.fetchQuery(btc), first);
  assert.equal(requests.length, 2);
});

test("each symbol and period has an independent cache entry", async (t) => {
  const { client, requests } = setup(t);
  const daily = await client.fetchQuery(marketQueryOptions("BTCUSDT", "24h"));
  const weekly = await client.fetchQuery(marketQueryOptions("BTCUSDT", "7d"));
  await client.fetchQuery(marketQueryOptions("ETHUSDT", "24h"));
  assert.equal(client.getQueryData(["market", "BTCUSDT", "24h"]), daily);
  assert.equal(client.getQueryData(["market", "BTCUSDT", "7d"]), weekly);
  assert.equal(requests.length, 3);
});

test("stale cached data stays visible while a background request refreshes it", async (t) => {
  const { client, observers } = setup(t);
  const options = marketQueryOptions("BTCUSDT", "24h");
  const cached = await client.fetchQuery(options);
  client.setQueryData(options.queryKey, cached, { updatedAt: Date.now() - MARKET_REFRESH_MS - 1 });
  let finish;
  global.fetch = () => new Promise((resolve) => { finish = resolve; });
  const observer = new QueryObserver(client, options);
  observers.push(observer);
  observer.subscribe(() => {});
  assert.equal(observer.getCurrentResult().data, cached);
  assert.equal(observer.getCurrentResult().isFetching, true);
  const pending = client.fetchQuery(options);
  finish({ ok: true, json: async () => ({ ...cached, updatedAt: "2026-10-05T13:00:00Z" }) });
  await pending;
  assert.equal(observer.getCurrentResult().data.updatedAt, "2026-10-05T13:00:00Z");
});

test("failed refresh preserves cached data and manual refresh retries even fresh data", async (t) => {
  const { client, requests, observers } = setup(t);
  const options = marketQueryOptions("BTCUSDT", "24h");
  const cached = await client.fetchQuery(options);
  const observer = new QueryObserver(client, { ...options, retry: false });
  observers.push(observer);
  global.fetch = async () => ({ ok: false, json: async () => ({ error: "Temporarily unavailable" }) });
  const failed = await observer.refetch();
  assert.equal(failed.error.message, "Temporarily unavailable");
  assert.equal(client.getQueryData(options.queryKey), cached);
  global.fetch = async () => { requests.push("manual refresh"); return { ok: true, json: async () => ({ ...cached, updatedAt: "2026-10-05T14:00:00Z" }) }; };
  const refreshed = await observer.refetch();
  assert.equal(refreshed.data.updatedAt, "2026-10-05T14:00:00Z");
  assert.equal(requests.length, 2);
});
