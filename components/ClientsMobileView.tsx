'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, UserPlus, Users, CheckCircle, Clock, Sparkles } from 'lucide-react'

interface Client {
  id: string
  name: string
  address?: string
  phone?: string
  status: string
  lastClean?: string | null
}

export default function ClientsMobileView({ clients, total, active, inactive }: {
  clients: Client[]
  total: number
  active: number
  inactive: number
}) {
  const [query, setQuery] = useState('')

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.address ?? '').toLowerCase().includes(query.toLowerCase())
  )

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const avatarColor = (name: string) => {
    const colors = [
      { bg: '#FCEFEC', color: '#E8A6A6' },
      { bg: '#E8F4F0', color: '#6B8F7A' },
      { bg: '#EFF6FF', color: '#93C5FD' },
      { bg: '#FEF9C3', color: '#F4B942' },
      { bg: '#F3E8FF', color: '#C084FC' },
    ]
    const i = name.charCodeAt(0) % colors.length
    return colors[i]
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search clients..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 12, border: '1.5px solid var(--line)', fontSize: 14, color: 'var(--teal)', background: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-outfit), sans-serif' }}
        />
      </div>

      {/* Add client button */}
      <Link href='/admin/clients/new' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--blush)', color: 'white', borderRadius: 50, padding: '16px', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: 16 }}>
        <UserPlus size={15} /> + Add Client
      </Link>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Clients', value: total, icon: Users, color: 'var(--teal)', bg: 'var(--blush-bg)' },
          { label: 'Active Clients', value: active, icon: CheckCircle, color: 'var(--sage-deep)', bg: '#E8F4F0' },
          { label: 'Inactive Clients', value: inactive, icon: Clock, color: '#F4B942', bg: '#FEFCE8' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: 12, padding: '12px 10px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color={color} strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2, lineHeight: 1.2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Client cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 14 }}>No clients found.</div>
        )}
        {filtered.map(client => {
          const av = avatarColor(client.name)
          return (
            <div key={client.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Left: avatar + name + last clean */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700 }}>
                  {initials(client.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--teal)', lineHeight: 1.3 }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                    Last clean: {client.lastClean ? fmtDate(client.lastClean) : '—'}
                  </div>
                </div>
              </div>

              {/* Right: two buttons side by side */}
              <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--line)', paddingLeft: 12, gap: 8 }}>
                <Link href={`/admin/clean?client=${client.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--blush)', color: 'white', borderRadius: 50, padding: '10px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  <Sparkles size={11} /> Clean
                </Link>
                <Link href={`/admin/clients/${client.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--teal)', border: '1.5px solid var(--line)', borderRadius: 50, padding: '10px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  View →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
