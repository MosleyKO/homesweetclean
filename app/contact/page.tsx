"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", bedrooms: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", service: "", bedrooms: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1.5px solid var(--line)",
    fontFamily: "var(--font-outfit), sans-serif",
    fontSize: 15,
    color: "var(--teal)",
    background: "white",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--teal)",
    display: "block",
    marginBottom: 8,
  };

  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--cream)", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 650, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Get in Touch ♥</div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, color: "var(--teal)", lineHeight: 1.1, marginBottom: 20 }}>
            Let's get your home{" "}
            <span style={{ fontFamily: "var(--font-allura), cursive", color: "var(--blush)", fontWeight: 400, fontSize: "1.15em" }}>sparkling clean.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7 }}>
            Fill out the form below and we'll get back to you within 24 hours with a free, no-obligation quote.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section style={{ padding: "60px 32px 100px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 60, alignItems: "start" }} className="contact-grid">

          {/* FORM */}
          <div style={{ background: "white", borderRadius: 20, padding: "48px", border: "1px solid var(--line)" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 28, fontWeight: 600, color: "var(--teal)", marginBottom: 8 }}>Request a Free Quote</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 36 }}>We'll reach out within 24 hours.</p>

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Sparkles size={40} color="var(--blush)" strokeWidth={1.5} /></div>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 26, color: "var(--teal)", marginBottom: 12 }}>
                  We got your message!
                </h3>
                <p style={{ fontFamily: "var(--font-allura), cursive", fontSize: 32, color: "var(--blush)", marginBottom: 16 }}>Thank you!</p>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
                  We'll be in touch within 24 hours with your free quote. We can't wait to help make your home shine.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="form-row">
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input style={inputStyle} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(435) 000-0000" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input style={inputStyle} required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="form-row">
                  <div>
                    <label style={labelStyle}>Service Interested In</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                      <option value="">Select a service...</option>
                      <option>Standard Cleaning</option>
                      <option>Deep Cleaning</option>
                      <option>Move In / Move Out</option>
                      <option>Recurring Cleaning</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Number of Bedrooms</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })}>
                      <option value="">Select...</option>
                      <option>Studio / 1 Bedroom</option>
                      <option>2 Bedrooms</option>
                      <option>3 Bedrooms</option>
                      <option>4 Bedrooms</option>
                      <option>5+ Bedrooms</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Anything else we should know?</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Special requests, pets, specific areas of focus..."
                  />
                </div>

                {status === "error" && (
                  <p style={{ color: "#E53E3E", fontSize: 14, fontFamily: "var(--font-montserrat), sans-serif" }}>
                    Something went wrong. Please try again or call us directly at (435) 681-0314.
                  </p>
                )}

                <button type="submit" className="btn-primary" disabled={status === "loading"} style={{ marginTop: 8, fontSize: 14, padding: "16px 32px" }}>
                  {status === "loading" ? "Sending..." : "Send My Quote Request ♥"}
                </button>
              </form>
            )}
          </div>

          {/* CONTACT INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { icon: <Phone size={20} color="var(--blush)" strokeWidth={1.5} />, label: "Call or Text", value: "(435) 681-0314", href: "tel:4356810314" },
              { icon: <Mail size={20} color="var(--blush)" strokeWidth={1.5} />, label: "Email Us", value: "hello@homesweetclean.co", href: "mailto:hello@homesweetclean.co" },
              { icon: <MapPin size={20} color="var(--blush)" strokeWidth={1.5} />, label: "Service Area", value: "St. George · Washington · Hurricane · Ivins · Santa Clara", href: null },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: "28px 24px", border: "1px solid var(--line)", display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--blush-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{item.label}</div>
                  {item.href ? (
                    <a href={item.href} style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 600, color: "var(--teal)", textDecoration: "none" }}>{item.value}</a>
                  ) : (
                    <p style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 16, fontWeight: 500, color: "var(--teal)" }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Hours */}
            <div style={{ background: "var(--cream-warm)", borderRadius: 16, padding: "28px 24px", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Hours</div>
              {[["Mon – Fri", "8am – 6pm"], ["Saturday", "9am – 2pm"], ["Sunday", "Closed"]].map(([day, hours]) => (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{day}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--teal)" }}>{hours}</span>
                </div>
              ))}
              <p style={{ fontFamily: "var(--font-allura), cursive", fontSize: 22, color: "var(--blush)", marginTop: 16 }}>
                Thank you for supporting our small business!
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
