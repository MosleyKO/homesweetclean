'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Search, X, ExternalLink, RefreshCw, Unlink } from 'lucide-react'

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

type StripeCustomerResult = {
  id: string
  name: string
  email: string
  phone: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  paid:           { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  open:           { bg: '#fef9c3', color: '#854d0e', label: 'Open' },
  draft:          { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  uncollectible:  { bg: '#fee2e2', color: '#991b1b', label: 'Uncollectible' },
  void:           { bg: '#f1f5f9', color: '#475569', label: 'Void' },
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

export default function StripeSection({
  clientId,
  stripeCustomerId: initialCustomerId,
  stripeCustomerName: initialCustomerName,
  invoices: initialInvoices,
}: {
  clientId: string
  stripeCustomerId: string | null
  stripeCustomerName: string | null
  invoices: Invoice[]
}) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState(initialCustomerId)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StripeCustomerResult[]>([])
  const [searching, setSearching] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    // Auto-sync on link
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
    } catch (e) {
      setSyncError('Network error — try again')
    }
    setSyncing(false)
  }

  const handleUnlink = async () => {
    if (!confirm('Unlink this Stripe customer? Invoice history will be removed.')) return
    await fetch('/api/stripe/link-customer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stripeCustomerId: null, stripeCustomerName: null }),
    })
    setCustomerId(null)
    setCustomerName(null)
    setInvoices([])
    router.refresh()
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CreditCard size={16} color='var(--teal)' strokeWidth={1.75} />
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>
            Invoices
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
                title="Sync invoices from Stripe"
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
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4,
                }}
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
        </div>
      </div>

      {/* Sync error */}
      {syncError && (
        <div style={{ padding: '10px 24px', background: '#fee2e2', borderBottom: '1px solid #fca5a5', fontSize: 13, color: '#991b1b', fontFamily: 'var(--font-outfit), sans-serif' }}>
          Sync error: {syncError}
        </div>
      )}

      {/* Search modal */}
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
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
                  border: '1.5px solid var(--line)', fontSize: 14,
                  fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)',
                  background: 'white', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={() => { setShowSearch(false); setQuery(''); setResults([]) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {searching && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Searching Stripe...</p>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleLink(c)}
                  disabled={linking}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)',
                    background: 'white', cursor: 'pointer', textAlign: 'left',
                    opacity: linking ? 0.6 : 1,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>{c.name || '(no name)'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    {c.id}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!searching && query.length >= 2 && results.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No Stripe customers found.</p>
          )}
        </div>
      )}

      {/* Invoice list */}
      {customerId && (
        invoices.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14 }}>
            No invoices found. Click Sync to pull from Stripe.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="invoices-desktop">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Date', 'Description', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const s = STATUS_STYLES[inv.status ?? 'draft'] ?? STATUS_STYLES.draft
                    return (
                      <tr key={inv.id} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--teal)' }}>
                          {inv.invoice_created_at ? new Date(inv.invoice_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--muted)', maxWidth: 240 }}>
                          {inv.description ?? '—'}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>
                          {fmt(inv.amount_due, inv.currency)}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
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

            {/* Mobile cards */}
            <div className="invoices-mobile" style={{ padding: '12px 16px', flexDirection: 'column', gap: 10 }}>
              {invoices.map(inv => {
                const s = STATUS_STYLES[inv.status ?? 'draft'] ?? STATUS_STYLES.draft
                return (
                  <div key={inv.id} style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--teal)' }}>
                        {fmt(inv.amount_due, inv.currency)}
                      </span>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                      {inv.invoice_created_at ? new Date(inv.invoice_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                    {inv.description && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{inv.description}</div>
                    )}
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

      {!customerId && !showSearch && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14 }}>
          Link a Stripe customer to see their invoice history.
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .invoices-desktop { display: block; }
        .invoices-mobile { display: none; }
        @media (max-width: 768px) {
          .invoices-desktop { display: none; }
          .invoices-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
