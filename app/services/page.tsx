import Link from "next/link";
import { Home, Sparkles, ArrowRightLeft, CalendarDays } from "lucide-react";

const iconStyle = { width: 24, height: 24, color: "var(--blush)", strokeWidth: 1.5 };

const services = [
  {
    icon: <Home {...iconStyle} />,
    title: "Standard Cleaning",
    desc: "Our standard clean is perfect for maintaining a fresh, tidy home on a regular basis. We cover all the essentials — dusting, vacuuming, mopping, kitchen surfaces, bathrooms, and more.",
    includes: ["Dust all surfaces & furniture", "Vacuum & mop floors", "Clean kitchen counters & appliances", "Scrub sinks, toilets & showers", "Empty trash cans", "Wipe mirrors & glass"],
  },
  {
    icon: <Sparkles {...iconStyle} />,
    title: "Deep Cleaning",
    desc: "A thorough, top-to-bottom clean designed to tackle buildup and get your home truly spotless. Great for first-time cleans, spring cleaning, or when things need a reset.",
    includes: ["Everything in Standard Cleaning", "Inside oven & microwave", "Inside fridge", "Baseboards & window sills", "Light fixtures & ceiling fans", "Cabinet fronts & door handles"],
  },
  {
    icon: <ArrowRightLeft {...iconStyle} />,
    title: "Move In / Move Out",
    desc: "Moving is stressful enough. Let us handle the cleaning so you can start fresh in your new home — or leave your old one spotless for the next family.",
    includes: ["Full deep clean of entire home", "Inside all cabinets & drawers", "Inside all appliances", "Walls & baseboards", "Windows (interior)", "Garage sweep (if applicable)"],
  },
  {
    icon: <CalendarDays {...iconStyle} />,
    title: "Recurring Cleaning",
    desc: "Keep your home consistently clean with our recurring plans. Choose the frequency that works best for your lifestyle and we'll handle the rest — every single time.",
    includes: ["Weekly, bi-weekly, or monthly", "Same trusted cleaner each visit", "Customizable checklist", "Flexible scheduling", "Easy rescheduling", "Loyalty discounts available"],
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
            Cleaning Services to Fit{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>Your Needs</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7 }}>
            From routine maintenance to deep cleans and everything in between — we have a service that fits your home and your life.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "60px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
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
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>
                  {s.icon}
                </div>
                <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 32, fontWeight: 600, color: "var(--teal)", marginBottom: 16 }}>{s.title}</h2>
                <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 28 }}>{s.desc}</p>
                <Link href="/contact" className="btn-primary">Book This Service</Link>
              </div>
              <div>
                <h4 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                  What's Included
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
      </section>

      {/* CTA */}
      <section style={{ margin: "0 32px 60px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Not sure which service is{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>right for you?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Reach out and we'll help you figure out exactly what you need.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
          <a href="tel:4356810314" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Call Us</a>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .service-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
