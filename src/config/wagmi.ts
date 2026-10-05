import { createConfig, http } from "wagmi";
import { mainnet, base, arbitrum, optimism, polygon, bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export function createWalletConfig() {
  return createConfig({
    chains: [mainnet, base, arbitrum, optimism, polygon, bsc],
    connectors: [
      injected({ target: "metaMask", shimDisconnect: true }),
      injected({ target: { id: "rabby", name: "Rabby Wallet", provider: "isRabby" }, shimDisconnect: true }),
      injected({ target: "coinbaseWallet", shimDisconnect: true }),
    ],
    multiInjectedProviderDiscovery: true,
    ssr: true,
    transports: { [mainnet.id]: http(), [base.id]: http(), [arbitrum.id]: http(), [optimism.id]: http(), [polygon.id]: http(), [bsc.id]: http() },
  });
}
