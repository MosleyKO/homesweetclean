import Link from "next/link";

const reviews = [
  { text: "Home Sweet Clean lives up to their name! My house has never looked better and the team is so kind and professional. I've tried other services and nothing compares.", author: "Jessica M.", location: "St. George, UT", stars: 5 },
  { text: "I've been using them for 6 months now and every single visit is consistent and thorough. I love coming home after they've been here.", author: "Rachel T.", location: "Washington, UT", stars: 5 },
  { text: "Booking was so easy and the results were incredible. I finally feel like I can relax in my own home on the weekends.", author: "Amber L.", location: "Hurricane, UT", stars: 5 },
  { text: "They did our move-out clean and got our full deposit back. Worth every penny.", author: "Mike & Sarah K.", location: "Ivins, UT", stars: 5 },
  { text: "The most thorough clean I've ever had. They got into every corner and the house smelled amazing when they were done.", author: "Brittany H.", location: "Santa Clara, UT", stars: 5 },
  { text: "Super professional and respectful. I felt completely comfortable having them in my home. Will absolutely rebook.", author: "Danielle R.", location: "St. George, UT", stars: 5 },
  { text: "As a busy mom of three, this service is a lifesaver. My house stays clean and I actually have time for my kids now.", author: "Taylor W.", location: "Washington, UT", stars: 5 },
  { text: "They're reliable, friendly, and do an exceptional job every time. I've referred three of my neighbors to them.", author: "Chris & Jenna P.", location: "St. George, UT", stars: 5 },
  { text: "I was nervous to let someone into my home but they made me feel so at ease. Honest, hard working, and incredibly detail oriented.", author: "Lauren S.", location: "Hurricane, UT", stars: 5 },
];

export default function ReviewsPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Client Reviews ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            What our clients<br />
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>are saying.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7 }}>
            Don't take our word for it. Here's what real Southern Utah families have to say about Home Sweet Clean.
          </p>

          {/* Stars summary */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 36 }}>
            <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 56, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>5.0</div>
            <div>
              <div style={{ color: "#F4B942", fontSize: 24, letterSpacing: 2 }}>★★★★★</div>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS GRID */}
      <section style={{ padding: "60px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{
              background: "white",
              borderRadius: 16,
              padding: "32px 28px",
              border: "1px solid var(--line)",
            }}>
              <div style={{ color: "#F4B942", fontSize: 16, letterSpacing: 2, marginBottom: 16 }}>
                {"★".repeat(r.stars)}
              </div>
              <p style={{ fontSize: 15, color: "var(--teal)", lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>
                "{r.text}"
              </p>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>— {r.author}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{r.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEAVE A REVIEW */}
      <section style={{ padding: "80px 32px", background: "var(--cream-warm)", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Share your experience</div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 600, color: "var(--teal)", marginBottom: 16 }}>
            Had a great clean?<br />
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>Tell us about it.</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 32, lineHeight: 1.7 }}>
            We'd love to hear about your experience. Your review helps other Southern Utah families find a cleaning service they can trust.
          </p>
          <a href="https://g.page/r/homesweetclean/review" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Leave a Google Review ★
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: "60px 32px", background: "var(--teal)", borderRadius: 20, padding: "60px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, color: "white", marginBottom: 8 }}>
            Ready to experience it{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.2em" }}>for yourself?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Join hundreds of happy Southern Utah families.</p>
        </div>
        <Link href="/contact" className="btn-primary">Book Your Clean Today ♥</Link>
      </section>
    </>
  );
}
