import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Sparkles, CheckCircle, Clock, Timer, Send } from 'lucide-react'

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

  const inProgress = recentCleans?.filter((c: any) => c.started_at && !c.ended_at).length ?? 0

  const stats = [
    { label: 'Total Clients', value: totalClients ?? 0, icon: Users, color: 'var(--teal)' },
    { label: 'Active Clients', value: activeClients ?? 0, icon: CheckCircle, color: 'var(--sage-deep)' },
    { label: 'Total Cleans', value: totalCleans ?? 0, icon: Sparkles, color: 'var(--blush)' },
    { label: 'Summaries Pending', value: pendingSummaries ?? 0, icon: Clock, color: '#F4B942' },
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      <style>{`
        .dash-actions { display: flex; gap: 12; flex-wrap: wrap; margin-bottom: 40px; }
        .dash-action-start { }
        .dash-action-add { }
        .dash-today { display: none; }
        .dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .dash-recent-table { display: block; }
        .dash-recent-cards { display: none; }

        @media (max-width: 768px) {
          .dash-today { display: block; margin-bottom: 12px; }
          .dash-actions { flex-direction: column; gap: 10px; margin-bottom: 12px; }
          .dash-action-start { display: block; background: var(--blush); color: white; text-align: center; padding: 16px; border-radius: 50px; font-family: var(--font-montserrat), sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; }
          .dash-action-add { display: block; background: white; color: var(--teal); text-align: center; padding: 14px; border-radius: 50px; font-family: var(--font-montserrat), sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border: 1.5px solid var(--line); }
          .dash-stats { grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 0; margin-top: 12px; }
          .dash-recent-table { display: none; }
          .dash-recent-cards { display: block; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Home Sweet Clean</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>
          Dashboard
        </h1>
      </div>

      {/* Today's Activity — mobile only */}
      <div className="dash-today">
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--line)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Timer size={15} color="#3B82F6" strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>{inProgress}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>In progress</div>
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', margin: '0 16px' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEFCE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={15} color="#F4B942" strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>{pendingSummaries ?? 0}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Summary pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — desktop only */}
      <div className="dash-stats">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 12, padding: '12px 10px', border: '1px solid var(--line)', textAlign: 'center' }}>
            <Icon size={16} color={color} strokeWidth={1.75} style={{ marginBottom: 6 }} />
            <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 24, fontWeight: 600, color: 'var(--teal)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="dash-actions">
        <Link href='/admin/clean' className='btn-primary dash-action-start'>+ Start a Clean</Link>
        <Link href='/admin/clients/new' className='btn-secondary dash-action-add'>+ Add Client</Link>
      </div>

      {/* Recent cleans — desktop table */}
      <div className="dash-recent-table">
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Cleans</h2>
          </div>
          {recentCleans && recentCleans.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  {['Client', 'Date', 'Duration', 'Summary', ''].map(h => (
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
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : '#fef9c3', color: clean.summary_sent ? '#166534' : '#854d0e' }}>
                          {clean.summary_sent ? 'Sent' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <Link href={`/admin/cleans/${clean.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                          VIEW →
                        </Link>
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

      {/* Recent cleans — mobile cards */}
      <div className="dash-recent-cards">
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Cleans</h2>
            <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentCleans && recentCleans.length > 0 ? recentCleans.map((clean: any) => {
            const duration = clean.started_at && clean.ended_at
              ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
              : null
            const name: string = (clean.clients as any)?.name ?? '—'
            const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: '1px solid var(--line)', textDecoration: 'none' }}>
                {/* Avatar */}
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--blush)' }}>
                  {initials}
                </div>
                {/* Name + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
                {/* Duration */}
                {duration ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 12, flexShrink: 0 }}>
                    <Clock size={12} strokeWidth={1.75} /> {duration} min
                  </div>
                ) : null}
                {/* Status badge */}
                <div style={{ flexShrink: 0 }}>
                  {clean.summary_sent ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: '#dcfce7', color: '#166534' }}>
                      <Send size={10} /> Sent
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
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              No cleans yet. <Link href='/admin/clean' style={{ color: 'var(--blush)', fontWeight: 600 }}>Start your first →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
