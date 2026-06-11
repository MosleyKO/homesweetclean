"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Phone, ChevronDown } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/why-choose-us", label: "Why Choose Us" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const serviceLinks = [
  { href: "/services", label: "All Services" },
  { href: "/services/residential", label: "Residential" },
  { href: "/services/commercial", label: "Commercial" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isServicesActive = pathname.startsWith("/services");

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
          <Link href="/" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: pathname === "/" ? "var(--blush)" : "var(--teal)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}>Home</Link>

          <Link href="/about" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: pathname === "/about" ? "var(--blush)" : "var(--teal)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}>About</Link>

          {/* Services dropdown */}
          <div className="services-dropdown-wrapper" style={{ position: "relative" }}>
            <Link href="/services" style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: isServicesActive ? "var(--blush)" : "var(--teal)",
              textDecoration: "none",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              Services <ChevronDown size={13} strokeWidth={2} />
            </Link>
            <div className="services-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 16px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "8px 0",
              minWidth: 180,
              boxShadow: "0 8px 32px rgba(31,78,95,0.10)",
              zIndex: 100,
            }}>
              {serviceLinks.map((s, i) => (
                <Link key={s.href} href={s.href} style={{
                  display: "block",
                  padding: "10px 20px",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: pathname === s.href ? "var(--blush)" : "var(--teal)",
                  textDecoration: "none",
                  borderBottom: i < serviceLinks.length - 1 ? "1px solid var(--line)" : "none",
                  transition: "color 0.15s",
                }}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {links.slice(2).map(l => (
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

          <button
            onClick={() => setOpen(!open)}
            className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none", flexDirection: "column", gap: 6 }}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="3" x2="17" y2="17" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="17" y1="3" x2="3" y2="17" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
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
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 0", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 14, fontWeight: 500, color: pathname === "/" ? "var(--blush)" : "var(--teal)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>
            Home
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 0", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 14, fontWeight: 500, color: pathname === "/about" ? "var(--blush)" : "var(--teal)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>
            About
          </Link>

          {/* Services expandable */}
          <div>
            <button onClick={() => setServicesOpen(!servicesOpen)} style={{
              width: "100%",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--line)",
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: isServicesActive ? "var(--blush)" : "var(--teal)",
            }}>
              Services
              <ChevronDown size={14} strokeWidth={2} style={{ transform: servicesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {servicesOpen && (
              <div style={{ background: "var(--blush-bg)", borderRadius: 8, margin: "4px 0 8px", overflow: "hidden" }}>
                {serviceLinks.map((s, i) => (
                  <Link key={s.href} href={s.href} onClick={() => { setOpen(false); setServicesOpen(false); }} style={{
                    display: "block",
                    padding: "11px 20px",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: pathname === s.href ? "var(--blush)" : "var(--teal)",
                    textDecoration: "none",
                    borderBottom: i < serviceLinks.length - 1 ? "1px solid var(--line)" : "none",
                  }}>
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {links.slice(2).map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              display: "block",
              padding: "12px 0",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: pathname === l.href ? "var(--blush)" : "var(--teal)",
              textDecoration: "none",
              borderBottom: i < links.slice(2).length - 1 ? "1px solid var(--line)" : "none",
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
        .services-dropdown { opacity: 0; pointer-events: none; transition: opacity 0.15s; }
        .services-dropdown-wrapper:hover .services-dropdown { opacity: 1; pointer-events: all; }
      `}</style>
    </nav>
  );
}
