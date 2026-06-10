import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock } from 'lucide-react'

export const revalidate = 0

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: tokenRow } = await supabase
    .from('client_tokens')
    .select('*, clients(id, name, address, property_type)')
    .eq('token', token)
    .single()

  if (!tokenRow) notFound()

  const client = tokenRow.clients as any

  const { data: cleans } = await supabase
    .from('cleans')
    .select('id, started_at, ended_at, notes, extras, noticed, summary_sent, clean_photos(id)')
    .eq('client_id', client.id)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const duration = (s: string, e: string) => Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-outfit), sans-serif' }}>
      <header style={{ background: 'var(--teal)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 22, color: 'white', fontWeight: 600, marginBottom: 4 }}>
          Home <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 28 }}>Sweet</span> Clean
        </div>
        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 4 }}>
          Your Clean History
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 64px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28, fontWeight: 600, color: 'var(--teal)', margin: '0 0 4px' }}>
            Welcome back, {client.name?.split(' ')[0]}!
          </h1>
          {client.address && (
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{client.address}</p>
          )}
        </div>

        {cleans && cleans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cleans.map((clean: any) => {
              const dur = clean.started_at && clean.ended_at ? duration(clean.started_at, clean.ended_at) : null
              const photoCount = clean.clean_photos?.length ?? 0
              return (
                <Link key={clean.id} href={`/report/${clean.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>
                        {clean.started_at ? fmtDate(clean.started_at) : '—'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {dur && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{dur} min</span>}
                        {photoCount > 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>}
                        {clean.extras?.length > 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{clean.extras.length} extra{clean.extras.length !== 1 ? 's' : ''}</span>}
                      </div>
                      {clean.noticed && (
                        <div style={{ fontSize: 12, color: 'var(--blush)', fontWeight: 600, marginTop: 6, fontFamily: 'var(--font-montserrat), sans-serif' }}>
                          ⚠ Things noticed
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      {clean.summary_sent
                        ? <CheckCircle size={18} color="var(--sage-deep)" strokeWidth={1.75} />
                        : <Clock size={18} color="#F4B942" strokeWidth={1.75} />
                      }
                      <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', letterSpacing: '0.06em' }}>VIEW →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            No completed cleans yet.
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="mailto:hello@homesweetclean.co" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textDecoration: 'none' }}>
            Questions? hello@homesweetclean.co
          </a>
        </div>
      </div>
    </div>
  )
}
