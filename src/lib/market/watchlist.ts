"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "gryphon-watchlist";
const EVENT = "gryphon-watchlist-change";
function snapshot() {
  try { return window.localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT, callback); };
}
export function useWatchlist() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const watchlist = useMemo<string[]>(() => {
    try {
      const values: unknown = JSON.parse(raw);
      return Array.isArray(values) ? [...new Set(values.filter((value): value is string => typeof value === "string" && /^[A-Z0-9]{2,30}USDT$/.test(value)))] : [];
    } catch { return []; }
  }, [raw]);
  const toggleWatch = (symbol: string) => {
    const next = watchlist.includes(symbol) ? watchlist.filter((item) => item !== symbol) : [...watchlist, symbol];
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event(EVENT)); } catch { /* Storage may be disabled by the browser. */ }
  };
  return { watchlist, toggleWatch };
}
