import {keepPreviousData, queryOptions} from "@tanstack/react-query";
import type {Interval, MarketResponse} from "./types";

export const MARKET_REFRESH_MS = 5 * 60 * 1000;

export function marketQueryOptions(symbol: string, interval: Interval) {
    return queryOptions({
        queryKey: ["market", symbol, interval] as const,
        queryFn: async ({signal}): Promise<MarketResponse> => {
            const response = await fetch(`/api/market?${new URLSearchParams({symbol, interval})}`, {
                signal,
                cache: "no-store"
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error || "Unable to load market data.");
            if (payload.symbol !== symbol || payload.interval !== interval || !Array.isArray(payload.candles) || !Array.isArray(payload.markets) || !Array.isArray(payload.catalog)) {
                throw new Error("Invalid market response.");
            }
            return payload;
        },
        staleTime: MARKET_REFRESH_MS,
        gcTime: 30 * 60 * 1000,
        refetchInterval: MARKET_REFRESH_MS,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        retry: 1,
        placeholderData: keepPreviousData,
    });
}
