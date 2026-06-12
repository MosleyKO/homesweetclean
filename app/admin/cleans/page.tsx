import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Send, Clock } from 'lucide-react'

export const revalidate = 0

export default async function CleansListPage() {
  const { data: cleans } = await supabase
    .from('cleans')
    .select('*, clients(id, name)')
    .order('started_at', { ascending: false })
    .limit(100)

  const allCleans = cleans ?? []

  const tz = 'America/Denver'
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 30, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>All Cleans</h1>
      </div>

      {/* Desktop table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden', display: 'none' }} className="cleans-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--cream)' }}>
              {['Client', 'Date', 'Time', 'Duration', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCleans.map((clean: any) => {
              const duration = clean.started_at && clean.ended_at
                ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
                : null
              const isInProgress = clean.started_at && !clean.ended_at
              return (
                <tr key={clean.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>
                    <Link href={`/admin/clients/${(clean.clients as any)?.id}`} style={{ color: 'var(--teal)', textDecoration: 'none' }}>
                      {(clean.clients as any)?.name ?? '—'}
                    </Link>
                  </td>
                  <td style={{ padding: '13px 20px', color: 'var(--muted)', fontSize: 14 }}>
                    {clean.started_at ? fmtDate(clean.started_at) : '—'}
                  </td>
                  <td style={{ padding: '13px 20px', color: 'var(--muted)', fontSize: 14 }}>
                    {clean.started_at ? fmtTime(clean.started_at) : '—'}
                  </td>
                  <td style={{ padding: '13px 20px', color: 'var(--muted)', fontSize: 14 }}>
                    {duration ? `${duration} min` : isInProgress ? 'In progress' : '—'}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : isInProgress ? '#e0f2fe' : '#fef9c3', color: clean.summary_sent ? '#166534' : isInProgress ? '#0284c7' : '#854d0e' }}>
                      {clean.summary_sent ? 'Sent' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <Link href={`/admin/cleans/${clean.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>VIEW →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {allCleans.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>No cleans yet.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="cleans-cards" style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        {allCleans.length > 0 ? allCleans.map((clean: any, i: number) => {
          const duration = clean.started_at && clean.ended_at
            ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
            : null
          const isInProgress = clean.started_at && !clean.ended_at
          const name: string = (clean.clients as any)?.name ?? '—'
          const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: i > 0 ? '1px solid var(--line)' : undefined, textDecoration: 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--blush)' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {clean.started_at ? fmtDate(clean.started_at) : '—'}
                  {duration ? ` · ${duration} min` : ''}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {clean.summary_sent ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: '#dcfce7', color: '#166534' }}>
                    <Send size={10} /> Sent
                  </span>
                ) : isInProgress ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: '#e0f2fe', color: '#0284c7' }}>
                    <Clock size={10} /> In Progress
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: '#FEFCE8', color: '#854d0e' }}>
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
            </Link>
          )
        }) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No cleans yet.</div>
        )}
      </div>

      <style>{`
        @media (min-width: 769px) {
          .cleans-table { display: block !important; }
          .cleans-cards { display: none !important; }
        }
      `}</style>
    </div>
  )
}
