import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Quote | Home Sweet Clean — St. George, UT",
  description: "Request a free, no-obligation home cleaning quote in St. George, Washington, Hurricane, Ivins, or Santa Clara, Utah. We respond within 24 hours.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
