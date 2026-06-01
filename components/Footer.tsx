import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--teal)", color: "white" }}>
      {/* Main footer */}
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "64px 32px 48px",
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr",
        gap: 48,
      }} className="footer-grid">
        {/* Brand */}
        <div>
          <Image src="/logo-circle.png" alt="Home Sweet Clean" width={90} height={90} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8, maxWidth: 240 }}>
            Clean spaces. Happy places. Serving Southern Utah with reliable, detail-focused home cleaning.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {["facebook", "instagram", "pinterest"].map(s => (
              <a key={s} href="#" style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", textDecoration: "none", fontSize: 14,
                transition: "border-color 0.2s",
              }}>
                {s === "facebook" ? "f" : s === "instagram" ? "ig" : "p"}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, opacity: 0.6 }}>
            Quick Links
          </h4>
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/services", label: "Services" },
            { href: "/why-choose-us", label: "Why Choose Us" },
            { href: "/reviews", label: "Reviews" },
            { href: "/contact", label: "Contact" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: "block", color: "rgba(255,255,255,0.75)", textDecoration: "none",
              fontSize: 14, marginBottom: 10, transition: "color 0.2s",
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, opacity: 0.6 }}>
            Contact Us
          </h4>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>📞 (435) 681-0314</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>✉ hello@homesweetclean.co</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>📍 Southern Utah</p>
        </div>

        {/* Hours */}
        <div>
          <h4 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, opacity: 0.6 }}>
            Hours
          </h4>
          {[
            { day: "Monday – Friday", hours: "8am – 6pm" },
            { day: "Saturday", hours: "9am – 2pm" },
            { day: "Sunday", hours: "Closed" },
          ].map(h => (
            <div key={h.day} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{h.day}</div>
              <div style={{ fontSize: 14, color: "white", fontWeight: 500 }}>{h.hours}</div>
            </div>
          ))}
          <p style={{ marginTop: 20, fontFamily: "var(--font-allura), cursive", fontSize: 22, color: "var(--blush)" }}>
            Thank you for supporting our small business!
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1280,
        margin: "0 auto",
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
      }}>
        <span>© {new Date().getFullYear()} Home Sweet Clean. All rights reserved.</span>
        <span>Insured · Eco-Friendly · Locally Owned</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
