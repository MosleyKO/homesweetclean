import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

const promises = [
  { title: "Friendly, professional service", desc: "We're approachable, respectful, and here to help." },
  { title: "Respect for your home", desc: "We treat your space like it's our own." },
  { title: "Attention to detail", desc: "We focus on the little things that make a big impact." },
  { title: "Clear communication", desc: "We keep you informed every step of the way." },
  { title: "Reliable scheduling", desc: "You can count on us to be there when we say we will." },
  { title: "Satisfaction-focused approach", desc: "If something's not right, we'll make it right." },
];

const areas = ["St. George", "Washington", "Hurricane", "Ivins", "Santa Clara"];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="about-hero-section" style={{ background: "var(--cream)", padding: "80px 32px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="two-col">
          <div>
            <div className="eyebrow">Meet the team</div>
            <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.05, marginBottom: 20 }}>
              Hi, we're{" "}
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em", whiteSpace: "nowrap" }}>Kinsey & Koby.</span>
            </h1>
            <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Southern Utah locals on a simple mission: give people their time back, one clean home at a time.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary">Book Your Clean</Link>
              <a href="#story" className="btn-secondary">Our Story ↓</a>
            </div>
          </div>
          <div className="about-hero-img" style={{ height: 480, borderRadius: "160px 16px 160px 16px", overflow: "hidden", position: "relative" }}>
            <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85" alt="Beautiful clean home" fill style={{ objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" style={{ padding: "60px 32px", background: "var(--cream-warm)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="two-col">
          <div className="story-img" style={{ height: 540, borderRadius: 16, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
            <Image src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&q=85" alt="Bright clean kitchen" fill style={{ objectFit: "cover" }} />
            <div style={{ background: "white", padding: "16px 22px", borderRadius: 10, margin: 24, boxShadow: "0 4px 24px rgba(31,78,95,0.08)", position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: 15, color: "var(--teal)" }}>Kinsey & Koby</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Founders · Southern Utah</div>
            </div>
          </div>
          <div>
            <div className="eyebrow">Our story</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 24 }}>
              A cleaner space is a{" "}
              <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.25em" }}>happier place.</span>
            </h2>
            <div style={{ width: 50, height: 2, background: "var(--blush)", marginBottom: 28 }} />
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 18, lineHeight: 1.75 }}>
              Home Sweet Clean started with the two of us, a passion for hospitality, and a belief that the spaces we live in shape how we feel. We saw friends and family stretched too thin — working hard, raising kids, building lives — and watching their weekends disappear into a never-ending cleaning list.
            </p>
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 18, lineHeight: 1.75 }}>
              So we built something different. A local cleaning company rooted right here in Southern Utah, focused on quality, consistency, and the small details that actually matter. We treat every home like it's our own — because to us, this isn't just a job.
            </p>
            <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75 }}>
              When we say we're invested in your home, we mean it. We show up. We pay attention. And we won't leave until it feels right.
            </p>
            <div className="story-signature" style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-allura), cursive", fontSize: 40, color: "var(--blush)", lineHeight: 1 }}>Kinsey & Koby</div>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>
                Founders, Home Sweet Clean
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCAL */}
      <section style={{ padding: "100px 32px", background: "var(--cream)", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Proudly local</div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 600, color: "var(--teal)", marginBottom: 20 }}>
            Proudly rooted in{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em", whiteSpace: "nowrap" }}>Southern Utah.</span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 580, margin: "0 auto 56px", lineHeight: 1.7 }}>
            We're not a national chain or a faceless app — we're your neighbors. When you book with us, you're supporting a local business and getting service from people who actually live here.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {areas.map(a => (
              <div key={a} style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "20px 24px",
                minWidth: 140,
                transition: "border-color 0.2s, transform 0.2s",
              }}>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><MapPin size={16} color="var(--blush)" strokeWidth={1.5} /></div>
                <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 600, color: "var(--teal)" }}>{a}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 40, fontFamily: "var(--font-fraunces), serif", fontStyle: "italic", fontSize: 17, color: "var(--muted)" }}>
            Don't see your area? Give us a call — we're growing.
          </p>
        </div>
      </section>

      {/* TIME BACK */}
      <section style={{ padding: "100px 32px", background: "var(--blush-bg)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What we really sell</div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 28 }}>
            We don't just clean homes.<br />
            <em style={{ fontStyle: "italic", color: "var(--blush-deep)" }}>We give you your time back.</em>
          </h2>
          <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.75, marginBottom: 20 }}>
            Time for the people you love. Time for the things that get you fired up. Time for an evening that doesn't end with a mop in your hand.
          </p>
          <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.75 }}>
            Because at the end of the day, a spotless kitchen isn't the point — the dinner you get to enjoy in it is.
          </p>
          <p style={{ marginTop: 40, fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontStyle: "italic", fontSize: 22, color: "var(--teal)" }}>
            "We clean homes so you can live yours."
          </p>
        </div>
      </section>

      {/* PROMISE */}
      <section style={{ padding: "100px 32px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }} className="two-col">
          <div style={{ height: 500, borderRadius: 16, overflow: "hidden", position: "relative" }}>
            <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=85" alt="Clean sparkling bathroom" fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <div className="eyebrow">Our promise</div>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 600, color: "var(--teal)", marginBottom: 12 }}>
              What you can expect, every visit.
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 36, fontSize: 16 }}>Six things we commit to — no exceptions, no excuses.</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {promises.map((p, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 16, padding: "16px 0", borderBottom: i < promises.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--sage)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</div>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 600, color: "var(--teal)", marginBottom: 4 }}>{p.title}</h4>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontSize: 34, lineHeight: 1 }}>— Kinsey & Koby</div>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>Signed, sealed, & delivered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ margin: "0 32px 60px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Ready for a cleaner,{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em", whiteSpace: "nowrap" }}>happier home?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Let us help take cleaning off your to-do list.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/contact" className="btn-primary">Book Your Clean</Link>
          <Link href="/contact" className="btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Get a Free Quote ♥</Link>
        </div>
      </section>

    </>
  );
}
