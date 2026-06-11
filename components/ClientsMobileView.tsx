'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Phone, UserPlus, Users, CheckCircle, Clock, Sparkles, MoreHorizontal } from 'lucide-react'

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
              {/* Left: avatar + info */}
              <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700 }}>
                  {initials(client.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginBottom: 6, lineHeight: 1.2 }}>{client.name}</div>
                  {client.address && (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 4 }}>
                      <MapPin size={11} color="var(--muted)" strokeWidth={1.75} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{client.address}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <Phone size={11} color="var(--muted)" strokeWidth={1.75} />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: last clean + actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '1px solid var(--line)', paddingLeft: 12, position: 'relative' }}>
                <Link href={`/admin/clients/${client.id}/edit`} style={{ position: 'absolute', top: 0, right: 0, padding: 4, color: 'var(--muted)', display: 'flex' }}>
                  <MoreHorizontal size={16} />
                </Link>
                <div>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Last Clean</div>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>
                    {client.lastClean ? fmtDate(client.lastClean) : '—'}
                  </div>
                </div>
                <Link href={`/admin/clean?client=${client.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--blush)', color: 'white', borderRadius: 50, padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', textDecoration: 'none', letterSpacing: '0.04em' }}>
                  Start Clean <Sparkles size={12} />
                </Link>
                <Link href={`/admin/clients/${client.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'white', color: 'var(--teal)', border: '1.5px solid var(--line)', borderRadius: 50, padding: '8px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', textDecoration: 'none' }}>
                  View Client →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
