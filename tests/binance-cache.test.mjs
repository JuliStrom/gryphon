import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

function load(name, dependencies = {}) {
  const filename = fileURLToPath(new URL(`../src/lib/market/${name}.ts`, import.meta.url));
  const loaded = new Module(filename);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const require = loaded.require.bind(loaded);
  loaded.require = (id) => dependencies[id] ?? require(id);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return loaded.exports;
}

const candle = (time = 0) => [time, "10", "12", "9", "11", "100"];
const response = (payload) => ({ ok: true, json: async () => payload });
function setup(t, fetch) {
  const original = global.fetch;
  global.fetch = fetch;
  t.after(() => { global.fetch = original; });
  return load("binance", { "./types": load("types") });
}

test("server caches ALL candles and deduplicates concurrent requests", async (t) => {
  let calls = 0;
  const api = setup(t, async () => { calls++; return response([candle()]); });
  const [first, second] = await Promise.all([api.getCandles("ZECUSDT", "all"), api.getCandles("ZECUSDT", "all")]);
  assert.deepEqual(first, second);
  await api.getCandles("ZECUSDT", "all");
  assert.equal(calls, 1);
});

test("expired candle cache reloads after five minutes", async (t) => {
  let calls = 0;
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  t.after(() => { Date.now = originalNow; });
  const api = setup(t, async () => { calls++; return response([candle()]); });
  await api.getCandles("ZECUSDT", "all");
  now += 300_001;
  await api.getCandles("ZECUSDT", "all");
  assert.equal(calls, 2);
});

test("failed upstream request is not cached", async (t) => {
  let calls = 0;
  const api = setup(t, async () => ++calls === 1 ? { ok: false, status: 502 } : response([candle()]));
  await assert.rejects(api.getCandles("ZECUSDT", "all"), /502/);
  assert.equal((await api.getCandles("ZECUSDT", "all")).length, 1);
  assert.equal(calls, 2);
});

test("ALL keeps every page of history with no truncation", async (t) => {
  const starts = [];
  const api = setup(t, async (url) => {
    const start = new URL(url).searchParams.get("startTime");
    starts.push(start);
    return response(start === "0" ? Array.from({ length: 1000 }, (_, i) => candle(i * 604_800_000)) : [candle(1000 * 604_800_000)]);
  });
  const candles = await api.getCandles("ZECUSDT", "all");
  assert.equal(candles.length, 1001);
  assert.deepEqual(starts, ["0", String(1000 * 604_800_000)]);
});

test("ticker request starts while exchange information is still pending", async (t) => {
  let tickerStarted = false;
  const api = setup(t, async () => {
    tickerStarted = true;
    return response([{ symbol: "ZECUSDT", lastPrice: "10", priceChangePercent: "1", highPrice: "12", lowPrice: "9", volume: "100", quoteVolume: "1000", closeTime: "100" }]);
  });
  let finish;
  const available = new Promise((resolve) => { finish = resolve; });
  const result = api.getMarkets(available);
  assert.equal(tickerStarted, true);
  finish([{ symbol: "ZECUSDT", asset: "ZEC", name: "ZEC" }]);
  assert.equal((await result)[0].symbol, "ZECUSDT");
});
