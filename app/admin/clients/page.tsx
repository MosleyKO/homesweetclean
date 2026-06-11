import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import ClientsMobileView from '@/components/ClientsMobileView'

export const revalidate = 0

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#166534' },
  lead: { bg: '#fef9c3', color: '#854d0e' },
  inactive: { bg: '#f1f5f9', color: '#475569' },
}

export default async function ClientsPage() {
  const [{ data: clients }, { data: recentCleans }] = await Promise.all([
    supabase.from('clients').select('*').order('name', { ascending: true }),
    supabase.from('cleans').select('client_id, started_at').order('started_at', { ascending: false }),
  ])

  // Build last clean map
  const lastCleanMap: Record<string, string> = {}
  for (const clean of recentCleans ?? []) {
    if (clean.client_id && !lastCleanMap[clean.client_id]) {
      lastCleanMap[clean.client_id] = clean.started_at
    }
  }

  const total = clients?.length ?? 0
  const active = clients?.filter(c => c.status === 'active').length ?? 0
  const inactive = clients?.filter(c => c.status === 'inactive').length ?? 0

  const mobileClients = (clients ?? []).map(c => ({
    id: c.id,
    name: c.name,
    address: c.address,
    phone: c.phone,
    status: c.status,
    lastClean: lastCleanMap[c.id] ?? null,
  }))

  return (
    <div style={{ maxWidth: 1200 }}>
      <style>{`
        .clients-desktop { display: block; }
        .clients-mobile { display: none; }
        @media (max-width: 768px) {
          .clients-desktop { display: none; }
          .clients-mobile { display: block; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Manage</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: '0 0 4px' }}>Clients</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>View and manage all of your clients.</p>
      </div>

      {/* Desktop layout */}
      <div className="clients-desktop">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Link href='/admin/clients/new' className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={15} /> Add Client
          </Link>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {clients && clients.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  {['Name', 'Address', 'Phone', 'Frequency', 'Last Clean', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client: any) => {
                  const s = statusColors[client.status] ?? statusColors.inactive
                  return (
                    <tr key={client.id} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>{client.name}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{client.address ?? '—'}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{client.phone ?? '—'}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{client.frequency ?? '—'}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>
                        {lastCleanMap[client.id] ? new Date(lastCleanMap[client.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color, textTransform: 'capitalize' }}>
                          {client.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <Link href={`/admin/clients/${client.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                          VIEW →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
              No clients yet. <Link href='/admin/clients/new' style={{ color: 'var(--blush)', fontWeight: 600 }}>Add your first client →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="clients-mobile">
        <ClientsMobileView clients={mobileClients} total={total} active={active} inactive={inactive} />
      </div>
    </div>
  )
}
