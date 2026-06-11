import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Mail, Key, FileText, Sparkles, Building2 } from 'lucide-react'
import StripeSection from '@/components/StripeSection'
import DeleteClientButton from '@/components/DeleteClientButton'

export const revalidate = 0

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#166534' },
  lead: { bg: '#fef9c3', color: '#854d0e' },
  inactive: { bg: '#f1f5f9', color: '#475569' },
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!client) notFound()

  const [{ data: cleans }, { data: invoices }] = await Promise.all([
    supabase
      .from('cleans')
      .select('*, clean_photos(url)')
      .eq('client_id', id)
      .order('started_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('*')
      .eq('client_id', id)
      .order('invoice_created_at', { ascending: false }),
  ])

  const s = statusColors[client.status] ?? statusColors.inactive

  return (
    <div style={{ maxWidth: 860 }}>
      <style>{`
        .client-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .client-name { font-size: 32px; margin: 8px 0 4px; }
        .client-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .clean-history-table { display: block; }
        .clean-history-cards { display: none; }

        @media (max-width: 768px) {
          .client-header { flex-direction: column; gap: 12px; margin-bottom: 20px; }
          .client-name { font-size: 24px !important; margin: 4px 0 4px !important; }
          .client-header-actions { display: flex; gap: 8px; width: 100%; }
          .client-header-actions a { flex: 1; justify-content: center; font-size: 13px !important; padding: 10px 12px !important; }
          .client-info-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; }
          .client-notes-card { margin-bottom: 16px !important; padding: 16px !important; }
          .clean-history-table { display: none; }
          .clean-history-cards { display: block; }
        }
      `}</style>

      {/* Header */}
      <div className="client-header">
        <div>
          <Link href='/admin/clients' style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em' }}>← CLIENTS</Link>
          <h1 className="client-name" style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, color: 'var(--teal)' }}>{client.name}</h1>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: s.bg, color: s.color, textTransform: 'capitalize' }}>
            {client.status}
          </span>
        </div>
        <div className="client-header-actions" style={{ display: 'flex', gap: 10 }}>
          <Link href={`/admin/clients/${client.id}/edit`} className='btn-secondary'>Edit</Link>
          <Link href={`/admin/clean?client=${client.id}`} className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} /> Start Clean
          </Link>
        </div>
      </div>

      {/* Contact + Access grid */}
      <div className="client-info-grid">
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', marginBottom: 14, marginTop: 0 }}>Contact</h2>
          {[
            { icon: MapPin, val: client.address },
            { icon: Phone, val: client.phone },
            { icon: Mail, val: client.email },
            ...(client.emails ?? []).map((e: string) => ({ icon: Mail, val: e })),
            { icon: Building2, val: client.property_type ? (client.property_type.charAt(0).toUpperCase() + client.property_type.slice(1)) : null },
          ].map(({ icon: Icon, val }) => val ? (
            <div key={val} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 9 }}>
              <Icon size={13} color='var(--blush)' strokeWidth={1.75} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--teal)' }}>{val}</span>
            </div>
          ) : null)}
          {client.frequency && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--muted)' }}>
              Frequency: <strong style={{ color: 'var(--teal)' }}>{client.frequency}</strong>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--blush-bg)', borderRadius: 14, border: '1px solid var(--blush-soft)', padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <Key size={13} color='var(--blush)' strokeWidth={1.75} />
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Access & Codes</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--teal)', lineHeight: 1.7, margin: 0 }}>
            {client.access_notes ?? <em style={{ color: 'var(--muted)' }}>No access notes added.</em>}
          </p>
        </div>
      </div>

      {/* Client notes */}
      {client.client_notes && (
        <div className="client-notes-card" style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <FileText size={14} color='var(--muted)' strokeWidth={1.75} />
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 15, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Notes</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{client.client_notes}</p>
        </div>
      )}

      {/* Stripe invoices */}
      <StripeSection
        clientId={client.id}
        stripeCustomerId={client.stripe_customer_id ?? null}
        stripeCustomerName={client.stripe_customer_name ?? null}
        invoices={invoices ?? []}
      />

      {/* Clean history */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Clean History</h2>
        </div>

        {cleans && cleans.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="clean-history-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Date', 'Start', 'End', 'Duration', 'Photos', 'Summary', ''].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cleans.map((clean: any) => {
                    const duration = clean.started_at && clean.ended_at
                      ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
                      : null
                    const fmt = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    return (
                      <tr key={clean.id} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>
                          {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{clean.started_at ? fmt(clean.started_at) : '—'}</td>
                        <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{clean.ended_at ? fmt(clean.ended_at) : '—'}</td>
                        <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{duration ? `${duration} min` : '—'}</td>
                        <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{clean.clean_photos?.length ?? 0}</td>
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
            </div>

            {/* Mobile cards */}
            <div className="clean-history-cards">
              {cleans.map((clean: any) => {
                const duration = clean.started_at && clean.ended_at
                  ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
                  : null
                return (
                  <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--line)', textDecoration: 'none', gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 3 }}>
                        {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {duration ? `${duration} min` : clean.clean_photos?.length > 0 ? `${clean.clean_photos.length} photos` : 'No duration'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : '#fef9c3', color: clean.summary_sent ? '#166534' : '#854d0e' }}>
                        {clean.summary_sent ? 'Sent' : 'Pending'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)' }}>→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
            No cleans logged yet for this client.
          </div>
        )}
      </div>
    </div>
  )
}
