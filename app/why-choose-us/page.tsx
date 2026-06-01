import Link from "next/link";
import { Home, Leaf, ShieldCheck, RefreshCw, Sparkles, MessageCircle, Heart, BadgeCheck } from "lucide-react";

const iconStyle = { width: 24, height: 24, color: "var(--blush)", strokeWidth: 1.5 };

const reasons = [
  { icon: <Home {...iconStyle} />, title: "Locally Owned & Operated", desc: "We're your neighbors — not a national franchise. When you hire us, you're investing in your own community." },
  { icon: <Leaf {...iconStyle} />, title: "Safe & Eco-Friendly Products", desc: "We use products that are safe for your kids, your pets, and the planet. Clean without compromise." },
  { icon: <ShieldCheck {...iconStyle} />, title: "Insured & Background Checked", desc: "Every member of our team is fully insured and background checked. Your home is in safe hands." },
  { icon: <RefreshCw {...iconStyle} />, title: "Consistent, Reliable Service", desc: "We show up when we say we will — every single time. No surprises, no excuses." },
  { icon: <Sparkles {...iconStyle} />, title: "Detail-Obsessed Cleaning", desc: "We don't just clean what you can see. We focus on the corners, the edges, the things others skip." },
  { icon: <MessageCircle {...iconStyle} />, title: "Communication You Can Count On", desc: "Easy scheduling, clear confirmations, and a team that's always reachable. No chasing us down." },
  { icon: <Heart {...iconStyle} />, title: "We Genuinely Care", desc: "This isn't just a job to us. We're passionate about the homes we clean and the families we serve." },
  { icon: <BadgeCheck {...iconStyle} />, title: "Satisfaction Guaranteed", desc: "Not happy with something? We'll come back and make it right. No questions asked." },
];

const stats = [
  { number: "100%", label: "Satisfaction Rate" },
  { number: "5★", label: "Average Review" },
  { number: "Local", label: "Southern Utah Based" },
  { number: "Insured", label: "Fully Background Checked" },
];

export default function WhyChooseUsPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Why Choose Us ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            Cleaning you can{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>actually trust.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7 }}>
            There are a lot of cleaning services out there. Here's why families in Southern Utah choose Home Sweet Clean — and keep coming back.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "var(--teal)", padding: "48px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 36, fontWeight: 700, color: "var(--blush)", lineHeight: 1 }}>{s.number}</div>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REASONS */}
      <section style={{ padding: "100px 32px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {reasons.map((r, i) => (
              <div key={i} style={{
                background: "white",
                borderRadius: 16,
                padding: "36px 28px",
                border: "1px solid var(--line)",
              }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                  {r.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20, fontWeight: 600, color: "var(--teal)", marginBottom: 12 }}>{r.title}</h3>
                <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ padding: "80px 32px", background: "var(--blush-bg)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 64, color: "var(--blush)", lineHeight: 0.8, marginBottom: 24 }}>"</div>
          <p style={{ fontFamily: "var(--font-fraunces), serif", fontStyle: "italic", fontSize: "clamp(20px, 3vw, 28px)", color: "var(--teal)", lineHeight: 1.5, marginBottom: 24 }}>
            We don't just clean homes. We give you your weekend back, your evenings back, and a space that feels like home again.
          </p>
          <p style={{ fontFamily: "var(--font-allura), cursive", fontSize: 32, color: "var(--blush)" }}>— Kinsey & Koby</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: "60px 32px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            See the{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>Home Sweet Clean</span>
            {" "}difference.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Book your first clean today — we think you'll love it.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Get a Free Quote ♥</Link>
          <Link href="/reviews" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Read Reviews</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
