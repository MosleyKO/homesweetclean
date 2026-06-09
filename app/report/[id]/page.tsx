import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export const revalidate = 0

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ sent?: string }> }) {
  const { id } = await params
  const { sent } = await searchParams

  const { data: clean } = await supabase
    .from('cleans')
    .select('*, clients(name, address, email), clean_photos(id, url)')
    .eq('id', id)
    .single()

  if (!clean) notFound()

  const client = clean.clients as any
  const photos = (clean.clean_photos as any[]) ?? []

  const duration = clean.started_at && clean.ended_at
    ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
    : null

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-outfit), sans-serif' }}>
      {/* Sent banner */}
      {sent === '1' && (
        <div style={{ background: '#dcfce7', borderBottom: '1px solid #86efac', padding: '12px 24px', textAlign: 'center', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 600, color: '#166534', letterSpacing: '0.04em' }}>
          ✓ Summary email sent to {client?.email}
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'var(--teal)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 22, color: 'white', fontWeight: 600, marginBottom: 4 }}>
          Home <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 28 }}>Sweet</span> Clean
        </div>
        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 4 }}>
          Clean Summary Report
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 64px' }}>

        {/* Hero card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--line)', padding: '32px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blush-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={26} color="var(--sage-deep)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 26, fontWeight: 600, color: 'var(--teal)', margin: '0 0 6px' }}>
            Your home is clean!
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 24px' }}>
            Here&apos;s a summary of today&apos;s clean at {client?.address ?? 'your home'}.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Date', value: clean.started_at ? fmtDate(clean.started_at) : '—' },
              { label: 'Time', value: clean.started_at && clean.ended_at ? `${fmtTime(clean.started_at)} – ${fmtTime(clean.ended_at)}` : '—' },
              { label: 'Duration', value: duration ? `${duration} min` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--cream)', borderRadius: 12, padding: '14px 10px' }}>
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 14, fontWeight: 600, color: 'var(--teal)', lineHeight: 1.3 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        {clean.extras && clean.extras.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: '0 0 14px' }}>Extra Services Completed</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(clean.extras as string[]).map(extra => (
                <span key={extra} style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--blush-bg)', border: '1px solid var(--blush-soft)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 13, color: 'var(--teal)', fontWeight: 500 }}>
                  ✓ {extra}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {clean.notes && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: '0 0 10px' }}>Notes from Your Cleaner</h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{clean.notes}</p>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', margin: '0 0 14px' }}>Photos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {photos.map((photo: any) => (
                <div key={photo.id} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden' }}>
                  <Image src={photo.url} alt="Clean photo" fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer message */}
        <div style={{ background: 'var(--teal)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, color: 'white', margin: '0 0 8px', fontWeight: 600 }}>
            Thank you, {client?.name?.split(' ')[0] ?? 'friend'}!
            <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 26, fontWeight: 400 }}> ♥</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
            It was a pleasure cleaning your home today. We hope you enjoy the fresh, clean feeling!
          </p>
          <a href="mailto:hello@homesweetclean.co" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--blush)', textDecoration: 'none' }}>
            hello@homesweetclean.co
          </a>
        </div>
      </div>
    </div>
  )
}
