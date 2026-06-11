import type { Metadata } from "next";
import Link from "next/link";
import { Home, Building2, Sparkles, ArrowRightLeft, CalendarDays, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Cleaning Services in Southern Utah | Home Sweet Clean",
  description: "Residential and commercial cleaning services in St. George, Washington, Hurricane, Ivins & Santa Clara, Utah. Locally owned, detail-obsessed, satisfaction guaranteed.",
};

const iconStyle = { width: 28, height: 28, color: "var(--blush)", strokeWidth: 1.5 };

const segments = [
  {
    icon: <Home {...iconStyle} />,
    label: "Residential",
    href: "/services/residential",
    headline: "For Your Home",
    desc: "Standard cleaning, deep cleaning, move in/out, and recurring plans — all tailored for busy Southern Utah families.",
    services: ["Standard Cleaning", "Deep Cleaning", "Move In / Move Out", "Recurring Plans"],
    cta: "View Residential Services",
  },
  {
    icon: <Building2 {...iconStyle} />,
    label: "Commercial",
    href: "/services/commercial",
    headline: "For Your Business",
    desc: "Office, retail, and small business cleaning on a schedule that works around you — before hours, after hours, or weekends.",
    services: ["Office Cleaning", "Deep / Initial Clean", "Recurring Service", "Move In / Move Out"],
    cta: "View Commercial Services",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Our Services ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            Cleaning services for your{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>home & business.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7 }}>
            Whether it&apos;s your family home or your place of business — we bring the same detail-focused standard to every space we clean in Southern Utah.
          </p>
        </div>
      </section>

      {/* SEGMENT CARDS */}
      <section style={{ padding: "60px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {segments.map((s) => (
            <div key={s.label} style={{ background: "white", borderRadius: 20, border: "1px solid var(--line)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "var(--blush-bg)", padding: "40px 40px 32px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 2px 12px rgba(232,166,166,0.15)" }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--blush)", marginBottom: 8 }}>
                  {s.label}
                </div>
                <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 30, fontWeight: 600, color: "var(--teal)", marginBottom: 12 }}>{s.headline}</h2>
                <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
              <div style={{ padding: "28px 40px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, flex: 1 }}>
                  {s.services.map((item, j) => (
                    <li key={j} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: j < s.services.length - 1 ? "1px solid var(--line)" : "none" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--sage)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 15, color: "var(--teal)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={s.href} className="btn-primary" style={{ textAlign: "center" }}>{s.cta} →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: "0 32px 60px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Not sure which service is{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>right for you?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Reach out and we&apos;ll help you figure out exactly what you need.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
          <a href="tel:4356810314" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Call Us</a>
        </div>
      </section>
    </>
  );
}
