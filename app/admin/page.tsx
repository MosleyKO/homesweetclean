import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Sparkles, CheckCircle, Clock } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const [{ count: totalClients }, { count: activeClients }, { count: totalCleans }, { count: pendingSummaries }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('cleans').select('*', { count: 'exact', head: true }),
    supabase.from('cleans').select('*', { count: 'exact', head: true }).eq('summary_sent', false).not('ended_at', 'is', null),
  ])

  const { data: recentCleans } = await supabase
    .from('cleans')
    .select('*, clients(name)')
    .order('started_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Clients', value: totalClients ?? 0, icon: Users, color: 'var(--teal)' },
    { label: 'Active Clients', value: activeClients ?? 0, icon: CheckCircle, color: 'var(--sage-deep)' },
    { label: 'Total Cleans', value: totalCleans ?? 0, icon: Sparkles, color: 'var(--blush)' },
    { label: 'Summaries Pending', value: pendingSummaries ?? 0, icon: Clock, color: '#F4B942' },
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Home Sweet Clean</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, padding: '24px 20px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
              <Icon size={16} color={color} strokeWidth={1.75} />
            </div>
            <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 36, fontWeight: 600, color: 'var(--teal)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <Link href='/admin/clean' className='btn-primary'>+ Start a Clean</Link>
        <Link href='/admin/clients/new' className='btn-secondary'>+ Add Client</Link>
      </div>

      {/* Recent cleans */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Cleans</h2>
          <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>VIEW ALL →</Link>
        </div>
        {recentCleans && recentCleans.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--cream)' }}>
                {['Client', 'Date', 'Duration', 'Summary'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCleans.map((clean: any) => {
                const duration = clean.started_at && clean.ended_at
                  ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
                  : null
                return (
                  <tr key={clean.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>{(clean.clients as any)?.name ?? '—'}</td>
                    <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>
                      {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>
                      {duration ? `${duration} min` : clean.started_at ? 'In progress' : '—'}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'var(--font-montserrat), sans-serif',
                        background: clean.summary_sent ? '#dcfce7' : '#fef9c3',
                        color: clean.summary_sent ? '#166534' : '#854d0e',
                      }}>
                        {clean.summary_sent ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
            No cleans logged yet. <Link href='/admin/clean' style={{ color: 'var(--blush)', fontWeight: 600 }}>Start your first one →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
