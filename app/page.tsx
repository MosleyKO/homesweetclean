import Link from "next/link";
import { Home, Sparkles, ArrowRightLeft, CalendarDays, ShieldCheck, Leaf, Star } from "lucide-react";

const iconStyle = { width: 22, height: 22, color: "var(--blush)", strokeWidth: 1.5 };

const services = [
  { icon: <Home {...iconStyle} />, title: "Standard Cleaning", desc: "Routine cleaning to keep your home fresh, tidy, and comfortable." },
  { icon: <Sparkles {...iconStyle} />, title: "Deep Cleaning", desc: "A detailed, top-to-bottom clean for a healthier home." },
  { icon: <ArrowRightLeft {...iconStyle} />, title: "Move In / Move Out", desc: "Start fresh in your new home — or leave your old one spotless." },
  { icon: <CalendarDays {...iconStyle} />, title: "Recurring Cleaning", desc: "Weekly, bi-weekly, or monthly options that fit your schedule." },
];

const features = [
  { icon: <ShieldCheck {...iconStyle} />, title: "Home Cleaning You Can Trust", desc: "We treat your home like our own." },
  { icon: <Star {...iconStyle} />, title: "Spotless Every Time", desc: "We pay attention to the details." },
  { icon: <Leaf {...iconStyle} />, title: "Safe & Eco-Friendly Products", desc: "Better for your home and your family." },
  { icon: <CalendarDays {...iconStyle} />, title: "Easy Online Booking", desc: "Book in minutes and we'll handle the rest." },
];

const reviews = [
  { text: "Home Sweet Clean lives up to their name! My house has never looked better and the team is so kind and professional.", author: "Jessica M." },
  { text: "I've tried other cleaning services and nothing compares. They're thorough, on time, and truly care about their work.", author: "Rachel T." },
  { text: "Booking was so easy and the results were incredible. I finally feel like I can relax in my own home.", author: "Amber L." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>♥ Clean Spaces. Happy Places.</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(44px, 7vw, 72px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.05, marginBottom: 8 }}>
            A cleaner home
          </h1>
          <h1 style={{ fontFamily: "var(--font-allura), cursive", fontSize: "clamp(52px, 8vw, 88px)", fontWeight: 400, color: "var(--blush)", lineHeight: 1.1, marginBottom: 24 }}>
            is a happier home.
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px" }}>
            We provide reliable, detail-focused cleaning services so you can enjoy a fresh, stress-free home.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary">Book Your Clean Today</Link>
            <Link href="/contact" className="btn-secondary">Get a Free Quote ♥</Link>
          </div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {["Trusted & Reliable", "Detail Oriented", "Satisfaction Guaranteed"].map(t => (
              <span key={t} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 500, color: "var(--teal)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--sage)", fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section style={{ background: "white", padding: "60px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: "36px 28px", background: "white", borderRight: i < features.length - 1 ? "1px solid var(--line)" : "none", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 600, color: "var(--teal)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section style={{ padding: "100px 32px", background: "var(--cream-warm)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="about-grid">
          <div style={{ height: 420, borderRadius: 16, background: "linear-gradient(135deg, var(--blush-soft), var(--cream-warm))", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <p style={{ color: "var(--muted)", fontStyle: "italic", fontSize: 14 }}>[ Photo coming soon ]</p>
          </div>
          <div>
            <div className="eyebrow">About Home Sweet Clean ♥</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.15, marginBottom: 20 }}>
              We believe a clean home creates a<br />
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontSize: "1.3em", fontWeight: 400 }}>happier life.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 16, lineHeight: 1.75 }}>
              At Home Sweet Clean, we're passionate about creating clean, comfortable spaces for busy people and families. Our team is reliable, thorough, and committed to making your home shine — every time.
            </p>
            <Link href="/about" className="btn-primary" style={{ marginTop: 8, display: "inline-flex" }}>Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "100px 32px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Our Services ♥</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--teal)" }}>
              Cleaning Services to Fit{" "}
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>Your Needs</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {services.map((s, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: "32px 28px", border: "1px solid var(--line)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 19, fontWeight: 600, color: "var(--teal)", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 20 }}>{s.desc}</p>
                <Link href="/services" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, fontWeight: 600, color: "var(--blush)", textDecoration: "none", letterSpacing: "0.06em" }}>
                  LEARN MORE →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: "100px 32px", background: "var(--cream-warm)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What Our Clients Say ♥</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24, marginTop: 40 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: "32px 28px", border: "1px solid var(--line)", textAlign: "left" }}>
                <div style={{ color: "var(--blush)", fontSize: 28, fontFamily: "var(--font-fraunces), serif", lineHeight: 1, marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 15, color: "var(--teal)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{r.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "#F4B942", fontSize: 13 }}>★★★★★</div>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>— {r.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: "0 32px 60px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Ready for a home you'll love{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>coming back to?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Let us take cleaning off your to-do list.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Book Your Clean Today ♥</Link>
          <Link href="/contact" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Get a Free Quote</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
