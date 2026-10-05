import type { Metadata } from "next";
import Realm from "@/components/realm/realm";

export const metadata: Metadata = {
  title: "The Realm — Gryphon",
  description: "Step into the Gryphon realm. A legacy beyond time.",
};

export default function RealmPage() {
  return <Realm />;
}
