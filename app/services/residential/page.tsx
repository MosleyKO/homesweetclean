import type { Metadata } from "next";
import Link from "next/link";
import { Home, Sparkles, ArrowRightLeft, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Residential Cleaning Services in St. George, UT | Home Sweet Clean",
  description: "Professional home cleaning for busy families in Southern Utah. Standard, deep, move in/out, and recurring cleaning services in St. George, Washington, Hurricane, Ivins & Santa Clara.",
};

const iconStyle = { width: 24, height: 24, color: "var(--blush)", strokeWidth: 1.5 };

const services = [
  {
    icon: <Home {...iconStyle} />,
    title: "Standard Cleaning",
    desc: "Perfect for maintaining a fresh, tidy home week to week. We cover all the essentials so you can come home to a space that already feels taken care of — without lifting a finger.",
    includes: ["Dust all surfaces & furniture", "Vacuum & mop all floors", "Clean kitchen counters & appliances", "Scrub sinks, toilets & showers", "Empty trash cans", "Wipe mirrors & glass"],
  },
  {
    icon: <Sparkles {...iconStyle} />,
    title: "Deep Cleaning",
    desc: "A thorough, top-to-bottom clean that gets into every corner, crevice, and forgotten spot. Ideal for a first-time clean, spring cleaning, or whenever your home needs a full reset.",
    includes: ["Everything in Standard Cleaning", "Inside oven & microwave", "Inside fridge", "Baseboards & window sills", "Light fixtures & ceiling fans", "Cabinet fronts & door handles"],
  },
  {
    icon: <ArrowRightLeft {...iconStyle} />,
    title: "Move In / Move Out",
    desc: "Moving is stressful enough without worrying about the cleaning. We'll leave your old place spotless for the next family — or get your new home truly fresh before you unpack a single box.",
    includes: ["Full deep clean of entire home", "Inside all cabinets & drawers", "Inside all appliances", "Walls & baseboards", "Windows (interior)", "Garage sweep (if applicable)"],
  },
  {
    icon: <CalendarDays {...iconStyle} />,
    title: "Recurring Cleaning",
    desc: "The most popular option for busy families. Choose weekly, bi-weekly, or monthly visits and we'll keep your home consistently clean — same trusted cleaners, same high standard, every time.",
    includes: ["Weekly, bi-weekly, or monthly", "Same trusted cleaner each visit", "Customizable cleaning checklist", "Flexible scheduling", "Easy rescheduling", "Loyalty discounts available"],
  },
];

const reasons = [
  { title: "Locally owned & operated", desc: "We're your neighbors — not a franchise. Southern Utah locals serving Southern Utah families." },
  { title: "Vetted & insured", desc: "Every cleaner is fully insured and background checked for your peace of mind." },
  { title: "Eco-friendly products", desc: "Safe for your kids, your pets, and your home. We clean without compromise." },
  { title: "Satisfaction guaranteed", desc: "Not happy with something? We'll come back and make it right. No questions asked." },
];

export default function ResidentialPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 750, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Residential Cleaning ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            Your home, cleaned by{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>people who care.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 32px" }}>
            We know how much your home means to you. We treat it that way — thorough, respectful, and consistent every single visit.
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

      {/* SERVICES */}
      <section id="services" style={{ padding: "80px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>What We Offer ♥</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1 }}>
              Services for every{" "}
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>home & schedule.</span>
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
                  <Link href="/contact" className="btn-primary">Book This Service</Link>
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
            Proudly serving{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>Washington County.</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
            We provide residential cleaning services across Southern Utah — including St. George, Washington, Hurricane, Ivins, and Santa Clara.
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
            Ready for a home you{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>love coming back to?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Get a free quote — we respond within 24 hours.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
          <a href="tel:4359007866" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Call Us</a>
        </div>
      </section>
    </>
  );
}
