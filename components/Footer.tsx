import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

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
            {[
              { href: "#", label: "Facebook", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
              { href: "#", label: "Instagram", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
              { href: "#", label: "Pinterest", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.38 1.27-5.38s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.53 0 .94-.6 2.33-.9 3.62-.26 1.08.53 1.96 1.58 1.96 1.89 0 3.16-2.43 3.16-5.31 0-2.19-1.48-3.72-3.59-3.72-2.45 0-3.88 1.83-3.88 3.73 0 .74.28 1.53.64 1.96.07.08.08.16.06.24l-.24.97c-.04.15-.13.18-.3.11C7.4 13.5 6.8 11.8 6.8 10.4c0-3.17 2.3-6.07 6.63-6.07 3.48 0 6.19 2.48 6.19 5.79 0 3.46-2.18 6.24-5.2 6.24-1.02 0-1.97-.53-2.3-1.15l-.62 2.33c-.22.86-.83 1.94-1.24 2.59.93.29 1.92.44 2.94.44 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg> },
            ].map((s, i) => (
              <a key={i} href={s.href} aria-label={s.label} style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", textDecoration: "none",
                transition: "border-color 0.2s",
              }}>
                {s.svg}
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
          {[
            { icon: <Phone size={14} strokeWidth={1.5} />, text: "(435) 681-0314" },
            { icon: <Mail size={14} strokeWidth={1.5} />, text: "hello@homesweetclean.co" },
            { icon: <MapPin size={14} strokeWidth={1.5} />, text: "Southern Utah" },
          ].map((item, i) => (
            <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ opacity: 0.6 }}>{item.icon}</span>{item.text}
            </p>
          ))}
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
