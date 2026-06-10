import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { CheckCircle, ClipboardList, Sparkles, ShieldCheck, Camera } from 'lucide-react'
import PhotoLightbox from '@/components/PhotoLightbox'

export const revalidate = 0

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ sent?: string }> }) {
  const { id } = await params
  const { sent } = await searchParams

  const { data: clean } = await supabase
    .from('cleans')
    .select('*, clients(name, address, email, property_type), clean_photos(id, url, room, photo_type)')
    .eq('id', id)
    .single()

  if (!clean) notFound()

  const client = clean.clients as any

  const { data: tokenRow } = await supabaseAdmin
    .from('client_tokens')
    .select('token')
    .eq('client_id', client?.id)
    .single()
  const portalUrl = tokenRow ? `/portal/${tokenRow.token}` : null
  const photos = (clean.clean_photos as any[]) ?? []
  const isCommercial = client?.property_type === 'commercial'

  const duration = clean.started_at && clean.ended_at
    ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
    : null

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Group regular photos by room
  const regularPhotos = photos.filter((p: any) => p.photo_type !== 'noticed')
  const noticedPhotos = photos.filter((p: any) => p.photo_type === 'noticed')
  const rooms = Array.from(new Set(regularPhotos.map((p: any) => p.room || 'General')))
  const photosByRoom = rooms.map(room => ({
    room,
    before: regularPhotos.filter((p: any) => (p.room || 'General') === room && p.photo_type === 'before'),
    after: regularPhotos.filter((p: any) => (p.room || 'General') === room && p.photo_type === 'after'),
    untagged: regularPhotos.filter((p: any) => (p.room || 'General') === room && !p.photo_type),
  }))

  const hasNoticed = !!(clean.noticed || noticedPhotos.length > 0)
  const hasNotes = !!clean.notes
  const hasExtras = clean.extras && clean.extras.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EF', fontFamily: 'var(--font-outfit), sans-serif' }}>
      <style>{`
        .report-container { max-width: 720px; margin: 0 auto; padding: 28px 20px 64px; }
        .hero-card { background: white; border-radius: 16px; border: 1px solid #E8DDD6; padding: 28px; margin-bottom: 20px; display: flex; align-items: center; gap: 24px; }
        .hero-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
        .hero-stats { display: flex; gap: 0; border-left: 1px solid #E8DDD6; padding-left: 24px; flex-shrink: 0; }
        .stat-cell { padding: 0 20px; text-align: center; border-right: 1px solid #E8DDD6; }
        .stat-cell:last-child { border-right: none; padding-right: 0; }
        .middle-row { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .photos-rooms { display: flex; flex-direction: column; gap: 24px; }

        @media (min-width: 900px) {
          .report-container { max-width: 1160px; padding: 36px 40px 80px; }
          .hero-card { padding: 32px 36px; }
          .middle-row { flex-direction: row; align-items: stretch; }
          .middle-card { flex: 1; }
          .photos-rooms { flex-direction: row; align-items: flex-start; gap: 20px; }
          .photos-room-col { flex: 1; min-width: 0; }
        }
      `}</style>

      {sent === '1' && (
        <div style={{ background: '#dcfce7', borderBottom: '1px solid #86efac', padding: '12px 24px', textAlign: 'center', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 600, color: '#166534' }}>
          ✓ Summary email sent to {client?.email}
        </div>
      )}

      <header style={{ background: 'var(--teal)', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 22, color: 'white', fontWeight: 600 }}>
          Home <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 28 }}>Sweet</span> Clean
        </div>
        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 4 }}>
          {isCommercial ? 'Commercial ' : ''}Clean Summary Report
        </div>
      </header>

      <div className="report-container">

        {/* Hero card */}
        <div className="hero-card">
          <div className="hero-left">
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={24} color="var(--sage-deep)" strokeWidth={1.5} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 600, color: 'var(--teal)', margin: '0 0 4px' }}>
                {isCommercial ? 'Your space is clean!' : 'Your home is clean!'}
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Here&apos;s a summary of today&apos;s clean{client?.address ? ` at ${client.address}` : ''}.
              </p>
            </div>
          </div>
          <div className="hero-stats">
            {[
              { label: 'Date', value: clean.started_at ? fmtDate(clean.started_at) : '—' },
              { label: 'Time', value: clean.started_at && clean.ended_at ? `${fmtTime(clean.started_at)} – ${fmtTime(clean.ended_at)}` : '—' },
              { label: 'Duration', value: duration ? `${duration} min` : '—' },
              { label: 'Cleaner', value: 'Kinsey' },
            ].map(({ label, value }) => (
              <div key={label} className="stat-cell">
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, whiteSpace: 'nowrap' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 14, fontWeight: 600, color: 'var(--teal)', lineHeight: 1.3 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle row — noticed / notes / extras */}
        {(hasNoticed || hasNotes || hasExtras) && (
          <div className="middle-row">

            {/* Home Health Report */}
            {hasNoticed && (
              <div className="middle-card" style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DDD6', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={16} color="var(--blush)" strokeWidth={1.75} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Home Health Report</h2>
                </div>
                {clean.noticed && (
                  <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '12px 14px', marginBottom: noticedPhotos.length > 0 ? 12 : 0 }}>
                    <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 700, color: '#B45309', letterSpacing: '0.06em', marginBottom: 8 }}>⚠ Attention Recommended</div>
                    {clean.noticed.split('\n').filter(Boolean).map((line: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: '#92400E', marginBottom: 4, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ color: '#F59E0B', marginTop: 2, flexShrink: 0 }}>•</span>{line}
                      </div>
                    ))}
                  </div>
                )}
                {noticedPhotos.length > 0 && (
                  <PhotoLightbox photos={noticedPhotos} />
                )}
              </div>
            )}

            {/* Notes */}
            {hasNotes && (
              <div className="middle-card" style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DDD6', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={16} color="var(--blush)" strokeWidth={1.75} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Notes from Your Cleaner</h2>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>{clean.notes}</p>
              </div>
            )}

            {/* Extras */}
            {hasExtras && (
              <div className="middle-card" style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DDD6', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} color="var(--blush)" strokeWidth={1.75} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Extra Services Completed</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(clean.extras as string[]).map(extra => (
                    <span key={extra} style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--blush-bg)', border: '1px solid var(--blush-soft)', fontSize: 13, color: 'var(--teal)', fontWeight: 500 }}>
                      ✓ {extra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        {regularPhotos.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Camera size={16} color="var(--blush)" strokeWidth={1.75} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Before &amp; After Photos</h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0', fontFamily: 'var(--font-montserrat), sans-serif' }}>See the difference we made today. Tap any photo to view full size.</p>
              </div>
            </div>

            <div className="photos-rooms">
              {photosByRoom.map(({ room, before, after, untagged }) => (
                <div key={room} className="photos-room-col">
                  <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--teal)', textAlign: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    {room}
                  </div>
                  {before.length > 0 && after.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, textAlign: 'center' }}>Before</div>
                        <PhotoLightbox photos={before} columns={1} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sage-deep)', marginBottom: 6, textAlign: 'center' }}>After</div>
                        <PhotoLightbox photos={after} columns={1} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {before.length > 0 && <>
                        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Before</div>
                        <PhotoLightbox photos={before} columns={1} />
                      </>}
                      {after.length > 0 && <>
                        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sage-deep)', marginBottom: 6, marginTop: before.length > 0 ? 12 : 0 }}>After</div>
                        <PhotoLightbox photos={after} columns={1} />
                      </>}
                      {untagged.length > 0 && <PhotoLightbox photos={untagged} />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portal link */}
        {portalUrl && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: 'var(--teal)', marginBottom: 2 }}>Want to see all your past cleans?</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>View your full clean history and past reports anytime.</div>
            </div>
            <a href={portalUrl} style={{ display: 'inline-block', background: 'var(--blush)', color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 24px', borderRadius: 50, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              View Clean History →
            </a>
          </div>
        )}

        {/* Footer */}
        <div style={{ background: 'var(--teal)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, color: 'white', margin: '0 0 8px', fontWeight: 600 }}>
            Thank you, {client?.name?.split(' ')[0] ?? 'friend'}!
            <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 26, fontWeight: 400 }}> ♥</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
            {isCommercial ? 'It was a pleasure cleaning your space today.' : 'It was a pleasure cleaning your home today. We hope you enjoy the fresh, clean feeling!'}
          </p>
          <a href="mailto:hello@homesweetclean.co" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--blush)', textDecoration: 'none' }}>
            hello@homesweetclean.co
          </a>
        </div>

      </div>
    </div>
  )
}
