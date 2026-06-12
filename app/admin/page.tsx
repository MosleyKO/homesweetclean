import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Sparkles, CheckCircle, Clock, Send, UserPlus, FileText, ChevronRight, DollarSign, TrendingUp } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
  const tz = 'America/Denver'
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const mtDateStr = (d: Date) => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d)
    return `${p.find(x => x.type === 'year')!.value}-${p.find(x => x.type === 'month')!.value}-${p.find(x => x.type === 'day')!.value}`
  }
  const mtWeekday = (d: Date) => weekdayNames.indexOf(d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' }))
  const todayDayNum = mtWeekday(now)
  const daysFromMonday = todayDayNum === 0 ? 6 : todayDayNum - 1
  const mtParts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const mtY = Number(mtParts.find(p => p.type === 'year')!.value)
  const mtM = Number(mtParts.find(p => p.type === 'month')!.value) - 1
  const mtD = Number(mtParts.find(p => p.type === 'day')!.value)
  const mondayMTDate = new Date(mtY, mtM, mtD - daysFromMonday)
  const mondayStr = `${mondayMTDate.getFullYear()}-${String(mondayMTDate.getMonth() + 1).padStart(2, '0')}-${String(mondayMTDate.getDate()).padStart(2, '0')}`

  const [
    { data: clients },
    { data: allCleans },
    { count: pendingSummaries },
    { data: invoicesMTD },
    { data: invoicesHistory },
    { data: paymentsMTD },
    { data: paymentsHistory },
  ] = await Promise.all([
    supabase.from('clients').select('id, name, status'),
    supabase.from('cleans').select('*, clients(name)').order('started_at', { ascending: false }).limit(60),
    supabase.from('cleans').select('*', { count: 'exact', head: true }).eq('summary_sent', false).not('ended_at', 'is', null),
    supabase.from('invoices').select('amount_paid').gte('invoice_created_at', startOfMonth).eq('status', 'paid'),
    supabase.from('invoices').select('amount_paid, invoice_created_at').gte('invoice_created_at', sixMonthsAgo).eq('status', 'paid').order('invoice_created_at', { ascending: true }),
    supabase.from('payments').select('amount').gte('payment_date', startOfMonth).eq('status', 'succeeded'),
    supabase.from('payments').select('amount, payment_date').gte('payment_date', sixMonthsAgo).eq('status', 'succeeded').order('payment_date', { ascending: true }),
  ])

  const activeClients = clients?.filter(c => c.status === 'active').length ?? 0
  const newLeads = clients?.filter(c => c.status === 'lead').length ?? 0
  const inactiveClients = clients?.filter(c => c.status === 'inactive').length ?? 0
  const cleaningsMTD = allCleans?.filter(c => c.started_at && c.started_at >= startOfMonth).length ?? 0
  const invoiceRevenueMTD = (invoicesMTD ?? []).reduce((sum, inv) => sum + (inv.amount_paid ?? 0), 0)
  const paymentRevenueMTD = (paymentsMTD ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const revenueMTD = (invoiceRevenueMTD + paymentRevenueMTD) / 100

  // Monthly revenue for line chart (last 6 months)
  const monthlyRevenue: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyRevenue[key] = 0
  }
  for (const inv of invoicesHistory ?? []) {
    if (!inv.invoice_created_at) continue
    const d = new Date(inv.invoice_created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyRevenue) monthlyRevenue[key] += (inv.amount_paid ?? 0) / 100
  }
  for (const pay of paymentsHistory ?? []) {
    if (!pay.payment_date) continue
    const d = new Date(pay.payment_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyRevenue) monthlyRevenue[key] += (pay.amount ?? 0) / 100
  }
  const revenueEntries = Object.entries(monthlyRevenue)
  const revenueValues = revenueEntries.map(([, v]) => v)
  const revenueLabels = revenueEntries.map(([k]) => {
    const [y, m] = k.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short' })
  })
  const maxRevenue = Math.max(...revenueValues, 1)

  // Build SVG line chart points (300×80 viewBox)
  const chartW = 300, chartH = 80, padL = 4, padR = 4, padT = 10, padB = 4
  const pts = revenueValues.map((v, i) => {
    const x = padL + (i / (revenueValues.length - 1 || 1)) * (chartW - padL - padR)
    const y = padT + (1 - v / maxRevenue) * (chartH - padT - padB)
    return { x, y, v }
  })
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = pts.length > 0
    ? `M${pts[0].x},${chartH} L${polyline.replace(/ /g, ' L')} L${pts[pts.length - 1].x},${chartH} Z`
    : ''

  // Cleans this week (all day math in MT)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const cleansByDay = [0, 0, 0, 0, 0, 0, 0]
  for (const clean of allCleans ?? []) {
    if (!clean.started_at) continue
    const d = new Date(clean.started_at)
    if (mtDateStr(d) < mondayStr) continue
    const idx = (mtWeekday(d) + 6) % 7
    cleansByDay[idx]++
  }
  const maxBars = Math.max(...cleansByDay, 1)
  const todayIdx = (todayDayNum + 6) % 7
  const totalCleansWeek = cleansByDay.reduce((a, b) => a + b, 0)

  const recentCleans = (allCleans ?? []).slice(0, 5)
  const pendingList = (allCleans ?? []).filter((c: any) => !c.summary_sent && c.ended_at).slice(0, 6)

  type ActivityEvent = { label: string; name: string; date: string }
  const activityEvents: ActivityEvent[] = []
  for (const clean of (allCleans ?? []).slice(0, 25)) {
    const name = (clean.clients as any)?.name ?? 'Unknown'
    if (clean.summary_sent && clean.summary_sent_at) {
      activityEvents.push({ label: 'Summary sent to', name, date: clean.summary_sent_at })
    } else if (clean.ended_at) {
      activityEvents.push({ label: 'Clean completed for', name, date: clean.ended_at })
    } else if (clean.started_at) {
      activityEvents.push({ label: 'Clean started for', name, date: clean.started_at })
    }
  }
  activityEvents.sort((a, b) => b.date.localeCompare(a.date))
  const activity = activityEvents.slice(0, 6)

  return (
    <div>
      <style>{`
        .dash-layout { display: flex; gap: 24px; align-items: flex-start; }
        .dash-left { flex: 1; min-width: 0; }
        .dash-right { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }
        .dash-stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .dash-actions-row { display: flex; gap: 16px; margin-bottom: 24px; }
        .dash-table { display: block; }
        .dash-bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .dash-cards { display: none; }
        .dash-mobile-stat-row { display: none; }
        .dash-mobile-action-col { display: none; }

        @media (max-width: 768px) {
          .dash-layout { flex-direction: column; align-items: stretch; }
          .dash-left { width: 100%; }
          .dash-right { display: none; width: 100%; }
          .dash-stat-cards { display: none; }
          .dash-actions-row { display: none; }
          .dash-bottom-row { display: none; }
          .dash-table { display: none; }
          .dash-cards { display: block; }
          .dash-mobile-stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 0; margin-top: 12px; }
          .dash-mobile-action-col { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; margin-top: 20px; }
        }
      `}</style>

      <div className="dash-layout">
        {/* ── LEFT COLUMN ── */}
        <div className="dash-left">

          {/* Mobile: compact stat row */}
          <div className="dash-mobile-stat-row">
            {[
              { label: 'Clients', value: activeClients + newLeads + inactiveClients, icon: Users, color: 'var(--teal)' },
              { label: 'Active', value: activeClients, icon: CheckCircle, color: 'var(--sage-deep)' },
              { label: 'Cleans', value: cleaningsMTD, icon: Sparkles, color: 'var(--blush)' },
              { label: 'Pending', value: pendingSummaries ?? 0, icon: Clock, color: '#F4B942' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: 'white', borderRadius: 12, padding: '12px 10px', border: '1px solid var(--line)', textAlign: 'center' }}>
                <Icon size={16} color={color} strokeWidth={1.75} style={{ marginBottom: 6 }} />
                <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 24, fontWeight: 600, color: 'var(--teal)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Mobile: action buttons */}
          <div className="dash-mobile-action-col">
            <Link href='/admin/clean' style={{ display: 'block', background: 'var(--blush)', color: 'white', textAlign: 'center', padding: 16, borderRadius: 50, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>+ Start a Clean</Link>
            <Link href='/admin/clients/new' style={{ display: 'block', background: 'white', color: 'var(--teal)', textAlign: 'center', padding: 14, borderRadius: 50, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', border: '1.5px solid var(--line)' }}>+ Add Client</Link>
          </div>

          {/* Desktop: stat cards — horizontal layout (icon left, text right) */}
          <div className="dash-stat-cards">
            {[
              { label: 'REVENUE (MTD)', value: `$${revenueMTD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'From invoices this month', icon: DollarSign, bg: '#dcfce7', iconColor: '#16a34a' },
              { label: 'CLEANINGS (MTD)', value: cleaningsMTD, sub: `${activeClients} active clients`, icon: Sparkles, bg: '#e0f2fe', iconColor: '#0284c7' },
              { label: 'NEW LEADS', value: newLeads, sub: 'In pipeline', icon: UserPlus, bg: '#fce7f3', iconColor: '#ec4899' },
              { label: 'SUMMARIES PENDING', value: pendingSummaries ?? 0, sub: 'Require attention', icon: FileText, bg: '#fef9c3', iconColor: '#ca8a04' },
            ].map(({ label, value, sub, icon: Icon, bg, iconColor }) => (
              <div key={label} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={iconColor} strokeWidth={1.75} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 26, fontWeight: 600, color: 'var(--teal)', lineHeight: 1, marginBottom: 2 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: action buttons */}
          <div className="dash-actions-row">
            <Link href='/admin/clean' className='btn-primary'>+ Start a Clean</Link>
            <Link href='/admin/clients/new' className='btn-secondary'>+ Add Client</Link>
          </div>

          {/* Recent cleans — desktop table */}
          <div className="dash-table">
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
                <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Cleans</h2>
              </div>
              {recentCleans.length > 0 ? (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--cream)' }}>
                        {['Client', 'Date', 'Duration', 'Status', ''].map(h => (
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
                            <td style={{ padding: '13px 24px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>{(clean.clients as any)?.name ?? '—'}</td>
                            <td style={{ padding: '13px 24px', color: 'var(--muted)', fontSize: 14 }}>
                              {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ padding: '13px 24px', color: 'var(--muted)', fontSize: 14 }}>
                              {duration ? `${duration} min` : clean.started_at ? 'In progress' : '—'}
                            </td>
                            <td style={{ padding: '13px 24px' }}>
                              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : !clean.ended_at ? '#e0f2fe' : '#fef9c3', color: clean.summary_sent ? '#166534' : !clean.ended_at ? '#0284c7' : '#854d0e' }}>
                                {clean.summary_sent ? 'Sent' : !clean.ended_at ? 'In Progress' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '13px 24px' }}>
                              <Link href={`/admin/cleans/${clean.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>VIEW →</Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '12px 24px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
                    <Link href='/admin/cleans' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>VIEW ALL CLEANS →</Link>
                  </div>
                </>
              ) : (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
                  No cleans yet. <Link href='/admin/clean' style={{ color: 'var(--blush)', fontWeight: 600 }}>Start your first one →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: bottom row */}
          <div className="dash-bottom-row">
            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
                <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Activity</h3>
              </div>
              {activity.length > 0 ? activity.map((ev, i) => {
                const isSummary = ev.label.includes('summary')
                const isCompleted = ev.label.includes('completed')
                const iconBg = isSummary ? '#dcfce7' : isCompleted ? '#e0f2fe' : '#fce7f3'
                const iconColor = isSummary ? '#16a34a' : isCompleted ? '#0284c7' : '#ec4899'
                const Icon = isSummary ? Send : isCompleted ? CheckCircle : Sparkles
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderTop: i > 0 ? '1px solid var(--line)' : undefined, gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={11} color={iconColor} strokeWidth={2} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--teal)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.label} <strong>{ev.name}</strong>
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              }) : (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No recent activity</div>
              )}
            </div>

            {/* Cleans This Week */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Cleans This Week</h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 22, fontWeight: 600, color: 'var(--blush)', lineHeight: 1 }}>{totalCleansWeek}</div>
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Total</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px 8px' }}>
                <svg viewBox="0 0 240 72" style={{ width: '100%', overflow: 'visible' }}>
                  {cleansByDay.map((count, i) => {
                    const barW = 10
                    const gap = 24
                    const x = i * (barW + gap) + 3
                    const barH = (count / maxBars) * 44
                    const y = 48 - barH
                    const isToday = i === todayIdx
                    return (
                      <g key={i}>
                        <rect x={x} y={barH > 0 ? y : 44} width={barW} height={barH > 0 ? barH : 4} rx={3} fill={isToday ? 'var(--blush)' : '#fce7f3'} />
                        <text x={x + barW / 2} y={barH > 0 ? y - 4 : 40} textAnchor="middle" fontSize="7" fill="var(--teal)" fontFamily="var(--font-montserrat), sans-serif" fontWeight="700">{count}</text>
                        <text x={x + barW / 2} y={62} textAnchor="middle" fontSize="7" fill={isToday ? 'var(--blush)' : 'var(--muted)'} fontFamily="var(--font-montserrat), sans-serif" fontWeight={isToday ? '700' : '400'}>{weekDays[i]}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
                <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.08em' }}>VIEW REPORTS →</Link>
              </div>
            </div>
          </div>

          {/* Mobile: recent cleans cards */}
          <div className="dash-cards">
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Recent Cleans</h2>
                <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>View all →</Link>
              </div>
              {recentCleans.length > 0 ? recentCleans.map((clean: any) => {
                const name: string = (clean.clients as any)?.name ?? '—'
                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: '1px solid var(--line)', textDecoration: 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--blush)' }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {clean.summary_sent ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: '#dcfce7', color: '#166534' }}>
                          <Send size={10} /> Sent
                        </span>
                      ) : !clean.ended_at ? (
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
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                  No cleans yet. <Link href='/admin/clean' style={{ color: 'var(--blush)', fontWeight: 600 }}>Start your first →</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="dash-right">

          {/* Pipeline Overview */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Pipeline Overview</h3>
              <Link href='/admin/pipeline' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.04em' }}>View all</Link>
            </div>
            <div style={{ padding: '4px 0' }}>
              {[
                { label: 'New Leads', count: newLeads, dot: '#f59e0b' },
                { label: 'Active Clients', count: activeClients, dot: '#22c55e' },
                { label: 'Inactive', count: inactiveClients, dot: '#94a3b8' },
                { label: 'Summaries Pending', count: pendingSummaries ?? 0, dot: '#0284c7' },
              ].map(({ label, count, dot }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--teal)', fontFamily: 'var(--font-outfit), sans-serif' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summaries to Send */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Summaries to Send</h3>
              {(pendingSummaries ?? 0) > 0 && (
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 700, background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 20 }}>
                  {pendingSummaries}
                </span>
              )}
            </div>
            {pendingList.length > 0 ? pendingList.map((clean: any, i: number) => (
              <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: i > 0 ? '1px solid var(--line)' : undefined, textDecoration: 'none', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', fontFamily: 'var(--font-montserrat), sans-serif' }}>{(clean.clients as any)?.name ?? '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {clean.ended_at ? new Date(clean.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <ChevronRight size={14} color='var(--blush)' strokeWidth={2.5} />
              </Link>
            )) : (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
                All summaries sent ✓
              </div>
            )}
          </div>

          {/* Revenue Trend — line chart */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TrendingUp size={14} color='var(--blush)' strokeWidth={2} />
              <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Revenue Trend</h3>
            </div>
            <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28, fontWeight: 600, color: 'var(--teal)', margin: '8px 0 2px' }}>
              ${revenueMTD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>This month</div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--blush)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--blush)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              {pts.length > 1 && <path d={areaPath} fill="url(#revenueGrad)" />}
              {/* Line */}
              {pts.length > 1 && (
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="var(--blush)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {/* Dots */}
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--blush)" stroke="white" strokeWidth="1.5" />
              ))}
              {/* Month labels */}
              {revenueLabels.map((label, i) => (
                <text
                  key={i}
                  x={padL + (i / (revenueLabels.length - 1 || 1)) * (chartW - padL - padR)}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--muted)"
                  fontFamily="var(--font-montserrat), sans-serif"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
