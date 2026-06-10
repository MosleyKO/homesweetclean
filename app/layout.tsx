import type { Metadata } from "next";
import { Fraunces, Montserrat, Outfit, Allura } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ConditionalShell from "@/components/ConditionalShell";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const allura = Allura({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-allura",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Home Sweet Clean — Clean Spaces. Happy Places.",
  description: "Reliable, detail-focused home cleaning services in Southern Utah. Serving St. George, Washington, Hurricane, Ivins, and Santa Clara.",
  metadataBase: new URL("https://www.homesweetclean.co"),
  openGraph: {
    title: "Home Sweet Clean — Clean Spaces. Happy Places.",
    description: "Reliable, detail-focused home cleaning services in Southern Utah. Book your clean today and get your time back.",
    url: "https://www.homesweetclean.co",
    siteName: "Home Sweet Clean",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Sweet Clean — Clean Spaces. Happy Places.",
    description: "Reliable, detail-focused home cleaning services in Southern Utah. Book your clean today and get your time back.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${montserrat.variable} ${outfit.variable} ${allura.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F4E5F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Home Sweet Clean" />
        <link rel="apple-touch-icon" href="/logo-circle.png" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-LVNGLJJ252" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LVNGLJJ252');
          `}
        </Script>
        <Script id="register-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
