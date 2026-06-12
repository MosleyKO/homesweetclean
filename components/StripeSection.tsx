'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Search, X, ExternalLink, RefreshCw, Unlink, UserX } from 'lucide-react'

type Invoice = {
  id: string
  stripe_invoice_id: string
  amount_due: number
  amount_paid: number
  currency: string
  status: string
  description: string | null
  invoice_url: string | null
  invoice_pdf: string | null
  due_date: string | null
  paid_at: string | null
  invoice_created_at: string | null
}

type Payment = {
  id: string
  stripe_charge_id: string
  amount: number
  currency: string
  status: string
  description: string | null
  receipt_url: string | null
  payment_date: string | null
}

type GuestCharge = {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  receipt_email: string | null
  receipt_url: string | null
  payment_date: string
}

type StripeCustomerResult = {
  id: string
  name: string
  email: string
  phone: string
}

const INV_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  paid:           { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  open:           { bg: '#fef9c3', color: '#854d0e', label: 'Open' },
  draft:          { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  uncollectible:  { bg: '#fee2e2', color: '#991b1b', label: 'Uncollectible' },
  void:           { bg: '#f1f5f9', color: '#475569', label: 'Void' },
}

const PAY_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  succeeded: { bg: '#dcfce7', color: '#166534', label: 'Succeeded' },
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  failed:    { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StripeSection({
  clientId,
  stripeCustomerId: initialCustomerId,
  stripeCustomerName: initialCustomerName,
  invoices: initialInvoices,
  payments: initialPayments,
}: {
  clientId: string
  stripeCustomerId: string | null
  stripeCustomerName: string | null
  invoices: Invoice[]
  payments: Payment[]
}) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState(initialCustomerId)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StripeCustomerResult[]>([])
  const [searching, setSearching] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [tab, setTab] = useState<'invoices' | 'payments'>('invoices')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Guest payment linking
  const [showGuest, setShowGuest] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCharges, setGuestCharges] = useState<GuestCharge[]>([])
  const [guestSearching, setGuestSearching] = useState(false)
  const [guestSelected, setGuestSelected] = useState<Set<string>>(new Set())
  const [guestLinking, setGuestLinking] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)
  const guestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Revenue calculations
  const invoiceRevenue = initialInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount_paid ?? 0), 0)
  const paymentRevenue = initialPayments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const totalRevenue = invoiceRevenue + paymentRevenue
  const currency = initialInvoices[0]?.currency ?? initialPayments[0]?.currency ?? 'usd'

  const handleSearch = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/stripe/search-customers?q=${encodeURIComponent(val)}`)
      const data = await res.json()
      setResults(data.customers ?? [])
      setSearching(false)
    }, 350)
  }

  const handleLink = async (customer: StripeCustomerResult) => {
    setLinking(true)
    await fetch('/api/stripe/link-customer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stripeCustomerId: customer.id, stripeCustomerName: customer.name }),
    })
    setCustomerId(customer.id)
    setCustomerName(customer.name)
    setShowSearch(false)
    setQuery('')
    setResults([])
    setLinking(false)
    await handleSync(customer.id)
  }

  const handleSync = async (cid?: string) => {
    const id = cid ?? customerId
    if (!id) return
    setSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/stripe/sync-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, stripeCustomerId: id }),
      })
      const data = await res.json()
      if (data.ok) {
        router.refresh()
      } else {
        setSyncError(data.error ?? 'Sync failed')
      }
    } catch {
      setSyncError('Network error — try again')
    }
    setSyncing(false)
  }

  const handleUnlink = async () => {
    if (!confirm('Unlink this Stripe customer? Invoice and payment history will be removed.')) return
    await fetch('/api/stripe/link-customer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stripeCustomerId: null, stripeCustomerName: null }),
    })
    setCustomerId(null)
    setCustomerName(null)
    router.refresh()
  }

  const handleGuestSearch = (val: string) => {
    setGuestEmail(val)
    setGuestError(null)
    if (guestDebounceRef.current) clearTimeout(guestDebounceRef.current)
    if (val.length < 3) { setGuestCharges([]); return }
    guestDebounceRef.current = setTimeout(async () => {
      setGuestSearching(true)
      const res = await fetch(`/api/stripe/search-guest-payments?email=${encodeURIComponent(val)}`)
      const data = await res.json()
      if (data.error) setGuestError(data.error)
      setGuestCharges(data.charges ?? [])
      setGuestSearching(false)
    }, 400)
  }

  const toggleGuestCharge = (id: string) => {
    setGuestSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleLinkGuest = async () => {
    if (!guestSelected.size) return
    setGuestLinking(true)
    const selected = guestCharges.filter(c => guestSelected.has(c.id))
    const res = await fetch('/api/stripe/link-guest-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, charges: selected }),
    })
    const data = await res.json()
    if (data.ok) {
      setShowGuest(false)
      setGuestEmail('')
      setGuestCharges([])
      setGuestSelected(new Set())
      router.refresh()
    } else {
      setGuestError(data.error ?? 'Failed to link payments')
    }
    setGuestLinking(false)
  }

  const hasData = initialInvoices.length > 0 || initialPayments.length > 0

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CreditCard size={16} color='var(--teal)' strokeWidth={1.75} />
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>
            Billing
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {customerId ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
                {customerName ?? customerId}
              </span>
              <button
                onClick={() => handleSync()}
                disabled={syncing}
                title="Sync from Stripe"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                  letterSpacing: '0.06em', color: 'var(--teal)', background: 'var(--cream)',
                  border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  opacity: syncing ? 0.6 : 1,
                }}
              >
                <RefreshCw size={12} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              <button
                onClick={handleUnlink}
                title="Unlink Stripe customer"
                style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
              >
                <Unlink size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                letterSpacing: '0.06em', color: 'white', background: 'var(--teal)',
                border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <Search size={12} /> Link Stripe Customer
            </button>
          )}
          <button
            onClick={() => { setShowGuest(v => !v); setGuestEmail(''); setGuestCharges([]); setGuestSelected(new Set()); setGuestError(null) }}
            title="Link guest checkout payments"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
              letterSpacing: '0.06em', color: 'var(--muted)', background: 'var(--cream)',
              border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <UserX size={12} /> Guest Payments
          </button>
        </div>
      </div>

      {/* Sync error */}
      {syncError && (
        <div style={{ padding: '10px 24px', background: '#fee2e2', borderBottom: '1px solid #fca5a5', fontSize: 13, color: '#991b1b', fontFamily: 'var(--font-outfit), sans-serif' }}>
          Sync error: {syncError}
        </div>
      )}

      {/* Search panel */}
      {showSearch && (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--cream)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                autoFocus
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', background: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={() => { setShowSearch(false); setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={18} />
            </button>
          </div>
          {searching && <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Searching Stripe...</p>}
          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map(c => (
                <button key={c.id} onClick={() => handleLink(c)} disabled={linking} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'white', cursor: 'pointer', textAlign: 'left', opacity: linking ? 0.6 : 1 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>{c.name || '(no name)'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-montserrat), sans-serif' }}>{c.id}</span>
                </button>
              ))}
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No Stripe customers found.</p>
          )}
        </div>
      )}

      {/* Guest payment search panel */}
      {showGuest && (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--cream)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--teal)', marginBottom: 2 }}>
                Link Guest Checkout Payments
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Search by the email used at checkout</div>
            </div>
            <button onClick={() => setShowGuest(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Email search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              autoFocus
              value={guestEmail}
              onChange={e => handleGuestSearch(e.target.value)}
              placeholder="guest@email.com"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', background: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {guestError && (
            <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 10 }}>Error: {guestError}</div>
          )}

          {guestSearching && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 10px' }}>Searching Stripe...</p>
          )}

          {guestCharges.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                Select payments to link to this client:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {guestCharges.map(c => {
                  const checked = guestSelected.has(c.id)
                  return (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 8,
                        border: `1.5px solid ${checked ? 'var(--teal)' : 'var(--line)'}`,
                        background: checked ? 'var(--blush-bg)' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGuestCharge(c.id)}
                        style={{ width: 16, height: 16, accentColor: 'var(--teal)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>
                            {fmt(c.amount, c.currency)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {fmtDate(c.payment_date)}
                          </span>
                        </div>
                        {c.description && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{c.description}</div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.receipt_email}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
              <button
                onClick={handleLinkGuest}
                disabled={guestSelected.size === 0 || guestLinking}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: guestSelected.size > 0 ? 'var(--teal)' : 'var(--line)',
                  color: 'white', fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  cursor: guestSelected.size > 0 ? 'pointer' : 'default',
                  opacity: guestLinking ? 0.6 : 1,
                }}
              >
                {guestLinking ? 'Linking...' : `Link ${guestSelected.size > 0 ? guestSelected.size : ''} Payment${guestSelected.size !== 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {!guestSearching && guestEmail.length >= 3 && guestCharges.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No guest payments found for that email.</p>
          )}
        </div>
      )}

      {/* Revenue summary */}
      {customerId && hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--line)' }}>
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue, currency) },
            { label: 'From Invoices', value: fmt(invoiceRevenue, currency) },
            { label: 'Standalone Payments', value: fmt(paymentRevenue, currency) },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '16px 24px', borderRight: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 22, fontWeight: 600, color: 'var(--teal)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      {customerId && hasData && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
          {([
            { key: 'invoices', label: `Invoices (${initialInvoices.length})` },
            { key: 'payments', label: `Payments (${initialPayments.length})` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 24px',
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.key ? 'var(--teal)' : 'var(--muted)',
                borderBottom: tab === t.key ? '2px solid var(--teal)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Invoice tab */}
      {customerId && tab === 'invoices' && (
        initialInvoices.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14 }}>
            No invoices found. Click Sync to pull from Stripe.
          </div>
        ) : (
          <>
            <div className="billing-desktop">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Date', 'Description', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialInvoices.map(inv => {
                    const s = INV_STATUS[inv.status ?? 'draft'] ?? INV_STATUS.draft
                    return (
                      <tr key={inv.id} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--teal)' }}>{fmtDate(inv.invoice_created_at)}</td>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--muted)', maxWidth: 240 }}>{inv.description ?? '—'}</td>
                        <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{fmt(inv.amount_due, inv.currency)}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          {inv.invoice_url && (
                            <a href={inv.invoice_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                              VIEW <ExternalLink size={11} />
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="billing-mobile" style={{ padding: '12px 16px', flexDirection: 'column', gap: 10 }}>
              {initialInvoices.map(inv => {
                const s = INV_STATUS[inv.status ?? 'draft'] ?? INV_STATUS.draft
                return (
                  <div key={inv.id} style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--teal)' }}>{fmt(inv.amount_due, inv.currency)}</span>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{fmtDate(inv.invoice_created_at)}</div>
                    {inv.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{inv.description}</div>}
                    {inv.invoice_url && (
                      <a href={inv.invoice_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                        View Invoice <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )
      )}

      {/* Payments tab */}
      {customerId && tab === 'payments' && (
        initialPayments.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14 }}>
            No standalone payments found. Click Sync to pull from Stripe.
          </div>
        ) : (
          <>
            <div className="billing-desktop">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Date', 'Description', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialPayments.map(pay => {
                    const s = PAY_STATUS[pay.status ?? 'pending'] ?? PAY_STATUS.pending
                    return (
                      <tr key={pay.id} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--teal)' }}>{fmtDate(pay.payment_date)}</td>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--muted)', maxWidth: 240 }}>{pay.description ?? '—'}</td>
                        <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{fmt(pay.amount, pay.currency)}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          {pay.receipt_url && (
                            <a href={pay.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                              RECEIPT <ExternalLink size={11} />
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="billing-mobile" style={{ padding: '12px 16px', flexDirection: 'column', gap: 10 }}>
              {initialPayments.map(pay => {
                const s = PAY_STATUS[pay.status ?? 'pending'] ?? PAY_STATUS.pending
                return (
                  <div key={pay.id} style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--teal)' }}>{fmt(pay.amount, pay.currency)}</span>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{fmtDate(pay.payment_date)}</div>
                    {pay.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{pay.description}</div>}
                    {pay.receipt_url && (
                      <a href={pay.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                        View Receipt <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )
      )}

      {!customerId && !showSearch && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14 }}>
          Link a Stripe customer to see billing history.
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .billing-desktop { display: block; }
        .billing-mobile { display: none; }
        @media (max-width: 768px) {
          .billing-desktop { display: none; }
          .billing-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
