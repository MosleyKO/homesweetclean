import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Mail, Key, FileText, Sparkles, Building2, Lock, BarChart2, Calendar } from 'lucide-react'
import StripeSection from '@/components/StripeSection'
import DeleteClientButton from '@/components/DeleteClientButton'
import CleanHistoryTable from '@/components/CleanHistoryTable'

export const revalidate = 0

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#166534' },
  lead: { bg: '#fef9c3', color: '#854d0e' },
  inactive: { bg: '#f1f5f9', color: '#475569' },
}

function daysAgo(dateStr: string): string {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!client) notFound()

  const [{ data: cleans }, { data: invoices }, { data: payments }] = await Promise.all([
    supabase.from('cleans').select('*, clean_photos(url)').eq('client_id', id).order('started_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('client_id', id).order('invoice_created_at', { ascending: false }),
    supabase.from('payments').select('*').eq('client_id', id).order('payment_date', { ascending: false }),
  ])

  const s = statusColors[client.status] ?? statusColors.inactive

  // Customer Snapshot metrics
  const completedCleans = (cleans ?? []).filter(c => c.ended_at)
  const invoiceRevenue = (invoices ?? []).filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount_paid ?? 0), 0) / 100
  const paymentRevenue = (payments ?? []).filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100
  const lifetimeRevenue = invoiceRevenue + paymentRevenue
  const totalCleans = completedCleans.length
  const avgTicket = totalCleans > 0 ? Math.round(lifetimeRevenue / totalCleans) : 0
  const lastClean = cleans?.[0]
  const pendingCount = (cleans ?? []).filter(c => !c.summary_sent && c.ended_at).length
  const customerSince = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div>
      <style>{`
        .cd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .cd-header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
        .cd-top-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .cd-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
        .cd-snapshot-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .cd-snapshot-cell { padding: 16px 20px; border-bottom: 1px solid var(--line); }
        .cd-snapshot-cell:nth-child(odd) { border-right: 1px solid var(--line); }
        .cd-snapshot-meta-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
        .cd-snapshot-meta-row:last-child { border-bottom: none; }
        .cd-history-table { display: block; }
        .cd-history-cards { display: none; }
        .cd-name { font-size: 36px; margin: 4px 0 6px; }
        .cd-name-row { display: block; }
        .cd-delete-desktop { display: flex; }
        .cd-delete-mobile { display: none; }

        @media (max-width: 768px) {
          .cd-header { flex-direction: column; gap: 10px; margin-bottom: 20px; }
          .cd-name-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
          .cd-name { font-size: 24px !important; margin: 4px 0 4px !important; flex: 1; }
          .cd-delete-desktop { display: none !important; }
          .cd-delete-mobile { display: flex; flex-shrink: 0; margin-top: 6px; }
          .cd-header-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
          .cd-header-actions a { justify-content: center; font-size: 13px !important; padding: 10px 12px !important; }
          .cd-top-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; }
          .cd-snapshot { display: none; }
          .cd-bottom-grid { grid-template-columns: 1fr; }
          .cd-history-table { display: none; }
          .cd-history-cards { display: block; }
        }
      `}</style>

      {/* Header */}
      <div className="cd-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em' }}>← Back to Clients</Link>
          <div className="cd-name-row">
            <h1 className="cd-name" style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, color: 'var(--teal)' }}>{client.name}</h1>
            <div className="cd-delete-mobile">
              <DeleteClientButton clientId={client.id} clientName={client.name} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color, textTransform: 'capitalize' }}>
              {client.status}
            </span>
            {customerSince && (
              <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
                Customer since {customerSince}
              </span>
            )}
          </div>
        </div>
        <div className="cd-header-actions">
          <div className="cd-delete-desktop">
            <DeleteClientButton clientId={client.id} clientName={client.name} />
          </div>
          <Link href={`/admin/clients/${client.id}/edit`} className='btn-secondary'>Edit</Link>
          <Link href={`/admin/clean?client=${client.id}`} className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} /> Start Clean
          </Link>
        </div>
      </div>

      {/* Top 3-column grid */}
      <div className="cd-top-grid">
        {/* Contact Information */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={13} color='var(--blush)' strokeWidth={1.75} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Contact Information</h2>
          </div>
          {[
            { icon: MapPin, val: client.address },
            { icon: Phone, val: client.phone },
            { icon: Mail, val: client.email },
            ...(client.emails ?? []).map((e: string) => ({ icon: Mail, val: e })),
            { icon: Building2, val: client.property_type ? (client.property_type.charAt(0).toUpperCase() + client.property_type.slice(1)) : null },
          ].map(({ icon: Icon, val }) => val ? (
            <div key={val} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <Icon size={13} color='var(--blush)' strokeWidth={1.75} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--teal)' }}>{val}</span>
            </div>
          ) : null)}
          {client.frequency && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--muted)' }}>
              Frequency: <strong style={{ color: 'var(--teal)' }}>{client.frequency}</strong>
            </div>
          )}
        </div>

        {/* Access & Codes */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={13} color='var(--blush)' strokeWidth={1.75} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Access &amp; Codes</h2>
          </div>
          {client.garage_code && (
            <div style={{ background: 'var(--blush-bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={14} color='var(--blush)' strokeWidth={1.75} />
              <div>
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Garage Code</div>
                <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 600, color: 'var(--teal)' }}>{client.garage_code}</div>
              </div>
            </div>
          )}
          {client.access_notes ? (
            <div>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Access Notes</div>
              <p style={{ fontSize: 13, color: 'var(--teal)', lineHeight: 1.7, margin: 0 }}>{client.access_notes}</p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>No access notes added.</p>
          )}
        </div>

        {/* Customer Snapshot */}
        <div className="cd-snapshot" style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={13} color='#0284c7' strokeWidth={1.75} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Customer Snapshot</h2>
          </div>

          {/* 2x2 metric grid */}
          <div className="cd-snapshot-row">
            <div className="cd-snapshot-cell">
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Lifetime Revenue</div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 24, fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>${lifetimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </div>
            <div className="cd-snapshot-cell">
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Total Cleans</div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 24, fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>{totalCleans}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>All time</div>
            </div>
            <div className="cd-snapshot-cell" style={{ borderBottom: 'none' }}>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Average Ticket</div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 24, fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>${avgTicket}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Per clean</div>
            </div>
            <div className="cd-snapshot-cell" style={{ borderBottom: 'none' }}>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Last Clean</div>
              {lastClean?.started_at ? (
                <>
                  <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>
                    {new Date(lastClean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{daysAgo(lastClean.started_at)}</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>No cleans yet</div>
              )}
            </div>
          </div>

          {/* Meta rows */}
          <div style={{ padding: '0 20px' }}>
            {pendingCount > 0 && (
              <div className="cd-snapshot-meta-row">
                <span style={{ color: 'var(--muted)' }}>Pending Summaries</span>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 700, fontSize: 15, color: '#ca8a04' }}>{pendingCount}</span>
              </div>
            )}
            {customerSince && (
              <div className="cd-snapshot-meta-row">
                <span style={{ color: 'var(--muted)' }}>Customer Since</span>
                <strong style={{ color: 'var(--teal)' }}>{customerSince}</strong>
              </div>
            )}
            {client.frequency && (
              <div className="cd-snapshot-meta-row">
                <span style={{ color: 'var(--muted)' }}>Service Frequency</span>
                <strong style={{ color: 'var(--teal)' }}>{client.frequency}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean History — full width */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={15} color='var(--blush)' strokeWidth={1.75} />
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Clean History</h2>
          </div>
        </div>

        {cleans && cleans.length > 0 ? (
          <CleanHistoryTable cleans={cleans} />
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
            No cleans logged yet for this client.
          </div>
        )}
      </div>

      {/* Bottom 2-col: Notes + Invoices */}
      <div className="cd-bottom-grid">
        {/* Notes */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={14} color='var(--blush)' strokeWidth={1.75} />
              <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Notes</h2>
            </div>
            <Link href={`/admin/clients/${client.id}/edit`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--blush-soft)', borderRadius: 8 }}>
              + Edit Notes
            </Link>
          </div>
          {client.client_notes ? (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>
                  {customerSince ? `${customerSince} · Admin` : 'Admin'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--teal)', lineHeight: 1.7, margin: 0 }}>{client.client_notes}</p>
            </div>
          ) : (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-outfit), sans-serif' }}>
              No notes added yet.
            </div>
          )}
        </div>

        {/* Invoices (Stripe) */}
        <StripeSection
          clientId={client.id}
          stripeCustomerId={client.stripe_customer_id ?? null}
          stripeCustomerName={client.stripe_customer_name ?? null}
          invoices={invoices ?? []}
          payments={payments ?? []}
        />
      </div>
    </div>
  )
}
