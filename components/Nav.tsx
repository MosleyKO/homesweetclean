"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Phone } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/why-choose-us", label: "Why Choose Us" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      background: "var(--cream)",
      borderBottom: "1px solid var(--line)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 32px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image src="/logo-wordmark.png" alt="Home Sweet Clean" width={220} height={44} style={{ objectFit: "contain" }} priority />
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: pathname === l.href ? "var(--blush)" : "var(--teal)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="tel:4356810314" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--teal)",
            textDecoration: "none",
            display: "none",
          }} className="nav-phone" onClick={() => {
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag("event", "phone_call_click", { event_category: "contact", event_label: "nav_desktop" });
            }
          }}>
            (435) 681-0314
          </a>
          <Link href="/contact" className="btn-primary nav-cta-btn" style={{ fontSize: 12, padding: "11px 22px" }}>
            Get a Quote ♥
          </Link>

          {/* Elegant menu icon */}
          <button
            onClick={() => setOpen(!open)}
            className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none", flexDirection: "column", gap: 6 }}
            aria-label="Toggle menu"
          >
            {open ? (
              // X close — two diagonal lines
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="3" x2="17" y2="17" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="17" y1="3" x2="3" y2="17" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              // Two-line refined menu icon
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <line x1="0" y1="1" x2="22" y2="1" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="15" x2="22" y2="15" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
          padding: "16px 32px 24px",
        }} className="mobile-menu">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              display: "block",
              padding: "12px 0",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: pathname === l.href ? "var(--blush)" : "var(--teal)",
              textDecoration: "none",
              borderBottom: "1px solid var(--line)",
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <a href="tel:4356810314" style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              color: "var(--teal)",
              textDecoration: "none",
            }} onClick={() => {
              if (typeof window !== "undefined" && window.gtag) {
                window.gtag("event", "phone_call_click", { event_category: "contact", event_label: "nav_mobile" });
              }
            }}><Phone size={14} strokeWidth={1.5} style={{ display: "inline", marginRight: 6 }} />(435) 681-0314</a>
            <Link href="/contact" className="btn-primary" onClick={() => setOpen(false)} style={{ textAlign: "center" }}>
              Get a Quote ♥
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .nav-phone { display: block !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
