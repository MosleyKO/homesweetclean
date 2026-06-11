'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Users, CheckCircle, Calendar, CalendarDays, SlidersHorizontal, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#166534' },
  lead: { bg: '#fef9c3', color: '#854d0e' },
  inactive: { bg: '#f1f5f9', color: '#475569' },
}

const invoiceColors: Record<string, { bg: string; color: string; label: string }> = {
  paid:          { bg: '#dcfce7', color: '#166534', label: 'Paid' },
  open:          { bg: '#fef9c3', color: '#854d0e', label: 'Open' },
  draft:         { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  uncollectible: { bg: '#fee2e2', color: '#991b1b', label: 'Overdue' },
  void:          { bg: '#f1f5f9', color: '#475569', label: 'Void' },
}

type Client = {
  id: string
  name: string
  address: string | null
  phone: string | null
  status: string
  frequency: string | null
  lastClean: string | null
  latestInvoiceStatus: string | null
}

const PAGE_SIZE = 10

export default function ClientsDesktopView({
  clients,
  total,
  active,
  weekly,
  monthly,
}: {
  clients: Client[]
  total: number
  active: number
  weekly: number
  monthly: number
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = clients.filter(c => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.address ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = [
    { label: 'Total Clients', sub: 'All time', value: total, icon: Users, color: '#e0e7ff', iconColor: '#4f46e5' },
    { label: 'Active Clients', sub: 'Currently active', value: active, icon: CheckCircle, color: '#dcfce7', iconColor: '#166534' },
    { label: 'Weekly Clients', sub: 'Weekly frequency', value: weekly, icon: Calendar, color: '#fef9c3', iconColor: '#854d0e' },
    { label: 'Monthly Clients', sub: 'Monthly frequency', value: monthly, icon: CalendarDays, color: '#fce7f3', iconColor: '#9d174d' },
  ]

  return (
    <div>
      {/* Top bar: search + add */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search clients by name, address, or phone..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              borderRadius: 10, border: '1.5px solid var(--line)',
              fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif',
              color: 'var(--teal)', background: 'white', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <Link href='/admin/clients/new' className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <UserPlus size={15} /> Add Client
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, sub, value, icon: Icon, color, iconColor }) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={iconColor} strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28, fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  {['Name', 'Address', 'Phone', 'Frequency', 'Last Clean', 'Invoice', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((client) => {
                  const s = statusColors[client.status] ?? statusColors.inactive
                  const inv = client.latestInvoiceStatus ? (invoiceColors[client.latestInvoiceStatus] ?? null) : null
                  return (
                    <tr key={client.id} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--teal)', fontSize: 14, whiteSpace: 'nowrap' }}>{client.name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 13 }}>{client.address ?? '—'}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{client.phone ?? '—'}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{client.frequency ?? '—'}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {client.lastClean ? new Date(client.lastClean).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {inv ? (
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: inv.bg, color: inv.color }}>
                            {inv.label}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color, textTransform: 'capitalize' }}>
                          {client.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Link href={`/admin/clients/${client.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                          VIEW →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={14} color='var(--teal)' />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span key={`ellipsis-${p}`} style={{ fontSize: 13, color: 'var(--muted)', padding: '0 4px' }}>...</span>
                      )}
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid', borderColor: page === p ? 'var(--teal)' : 'var(--line)', background: page === p ? 'var(--teal)' : 'white', color: page === p ? 'white' : 'var(--teal)', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {p}
                      </button>
                    </>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={14} color='var(--teal)' />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
            {query ? `No clients matching "${query}"` : <>No clients yet. <Link href='/admin/clients/new' style={{ color: 'var(--blush)', fontWeight: 600 }}>Add your first client →</Link></>}
          </div>
        )}
      </div>
    </div>
  )
}
