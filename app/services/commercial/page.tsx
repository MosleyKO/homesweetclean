import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Sparkles, CalendarDays, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Commercial Cleaning Services in St. George, UT | Home Sweet Clean",
  description: "Professional commercial cleaning for offices, small businesses, and retail in Southern Utah. Reliable, detail-focused, locally owned. Get a free quote today.",
};

const iconStyle = { width: 24, height: 24, color: "var(--blush)", strokeWidth: 1.5 };

const services = [
  {
    icon: <Building2 {...iconStyle} />,
    title: "Office Cleaning",
    desc: "A clean workspace isn't just about appearances — it affects how your team feels and how your clients see you. We keep your office consistently clean so you can stay focused on the work that matters.",
    includes: ["Dust desks, shelves & surfaces", "Vacuum & mop all floors", "Clean kitchen & break room", "Sanitize bathrooms", "Empty all trash & recycling", "Wipe down doors & light switches"],
  },
  {
    icon: <Sparkles {...iconStyle} />,
    title: "Deep Clean / Initial Clean",
    desc: "Starting fresh with a new space or preparing for a big event? Our commercial deep clean goes beyond the surface to leave every corner of your business truly spotless.",
    includes: ["Everything in standard office clean", "Baseboards & window sills", "Interior windows & glass", "Light fixtures & vents", "Cabinet fronts & drawer pulls", "Detailed scrub of all bathrooms"],
  },
  {
    icon: <CalendarDays {...iconStyle} />,
    title: "Recurring Commercial Service",
    desc: "Keep your business looking its best on a schedule that works for you. We offer flexible recurring plans — daily, weekly, or bi-weekly — with the same reliable team every visit.",
    includes: ["Daily, weekly, or bi-weekly options", "Consistent team for your location", "Customizable cleaning checklist", "Early morning or after-hours available", "Easy scheduling & rescheduling", "Dedicated point of contact"],
  },
  {
    icon: <ShieldCheck {...iconStyle} />,
    title: "Move In / Move Out",
    desc: "Relocating your business or handing back a commercial space? We'll make sure you leave it spotless — protecting your deposit and your reputation.",
    includes: ["Full deep clean of entire space", "Inside all cabinets & storage", "Appliances & break room equipment", "Walls, baseboards & trim", "Interior windows", "Final walkthrough ready"],
  },
];

const reasons = [
  { title: "Locally owned", desc: "We're invested in this community. When your business looks great, Southern Utah looks great." },
  { title: "Fully insured", desc: "Licensed and insured for commercial work. You're covered." },
  { title: "Flexible scheduling", desc: "Before hours, after hours, weekends — we work around your business." },
  { title: "Consistent & reliable", desc: "Same team, same standard, every visit. No surprises." },
];

const businessTypes = ["Offices & Suites", "Retail Shops", "Medical & Dental", "Real Estate Staging", "Vacation Rentals", "Small Business"];

export default function CommercialPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 750, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Commercial Cleaning ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            A cleaner business makes a{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>stronger impression.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 32px" }}>
            From small offices to retail spaces, we bring the same detail-focused standard to every commercial property we clean in Southern Utah.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
            <Link href="#services" className="btn-secondary">See Our Services ↓</Link>
          </div>
        </div>
      </section>

      {/* WHY US STRIP */}
      <section style={{ background: "var(--teal)", padding: "40px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {reasons.map((r, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 16, fontWeight: 600, color: "white", marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS TYPES */}
      <section style={{ background: "var(--blush-bg)", padding: "48px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
            We clean for
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {businessTypes.map(type => (
              <span key={type} style={{ background: "white", border: "1px solid var(--line)", borderRadius: 24, padding: "10px 22px", fontFamily: "var(--font-fraunces), serif", fontSize: 15, fontWeight: 600, color: "var(--teal)" }}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: "80px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>What We Offer ♥</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1 }}>
              Commercial services built around{" "}
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>your schedule.</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {services.map((s, i) => (
              <div key={i} style={{
                background: "white",
                borderRadius: 20,
                padding: "48px",
                border: "1px solid var(--line)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                alignItems: "start",
              }} className="service-row">
                <div>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    {s.icon}
                  </div>
                  <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 32, fontWeight: 600, color: "var(--teal)", marginBottom: 16 }}>{s.title}</h2>
                  <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 28 }}>{s.desc}</p>
                  <Link href="/contact" className="btn-primary">Get a Quote</Link>
                </div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                    What&apos;s Included
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {s.includes.map((item, j) => (
                      <li key={j} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: j < s.includes.length - 1 ? "1px solid var(--line)" : "none" }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--sage)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 15, color: "var(--teal)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section style={{ padding: "60px 32px", background: "var(--cream-warm)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Where We Clean ♥</div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 600, color: "var(--teal)", marginBottom: 16 }}>
            Serving businesses across{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>Washington County.</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
            We provide commercial cleaning services throughout Southern Utah — including St. George, Washington, Hurricane, Ivins, and Santa Clara.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["St. George", "Washington", "Hurricane", "Ivins", "Santa Clara"].map(city => (
              <span key={city} style={{ background: "white", border: "1px solid var(--line)", borderRadius: 24, padding: "8px 20px", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>
                {city}, UT
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: "60px 32px 60px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Let&apos;s keep your business{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>looking its best.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Get a free commercial cleaning quote — we respond within 24 hours.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
          <a href="tel:4356810314" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Call Us</a>
        </div>
      </section>
    </>
  );
}
