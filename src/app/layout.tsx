import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/realm.css";
import "@/styles/terminal.css";
import "@/styles/wallet.css";
import "@/styles/responsive.css";
import WalletProvider from "@/components/providers/wallet-provider";
import ParticleBackground from "@/components/background/particle-background";

export const metadata: Metadata = {
  title: "Gryphon",
  icons: {
    icon: [{ url: "/gryphon-icon.png?v=2", type: "image/png", sizes: "64x64" }],
    shortcut: "/gryphon-icon.png?v=2",
  },
  description: "Empires fall, gold remembers, and the Gryphon keeps what time cannot erase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ParticleBackground />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
