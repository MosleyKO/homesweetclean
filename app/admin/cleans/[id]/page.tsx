'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, X, Trash2, Send, ExternalLink } from 'lucide-react'

const RESIDENTIAL_EXTRAS = [
  'Steam mop floors', 'Clean inside oven', 'Clean inside fridge',
  'Wash windows', 'Change bed linens', 'Clean inside microwave',
  'Wipe down blinds', 'Clean garage', 'Scrub tile grout', 'Organize pantry',
]

const COMMERCIAL_EXTRAS = [
  'Steam mop floors', 'Wash windows', 'Wipe down blinds',
  'Scrub tile grout', 'Sanitize restrooms', 'Clean break room',
  'Dust surfaces & furniture', 'Clean glass partitions', 'Empty trash bins',
]

const CLEANERS = ['Kinsey', 'Koby']

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 10,
  border: '1.5px solid var(--line)', fontSize: 15,
  fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)',
  background: 'white', outline: 'none', boxSizing: 'border-box' as const,
}

const labelStyle = {
  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
  fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: 'var(--muted)', marginBottom: 6, display: 'block',
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CleanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clean, setClean] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [customExtra, setCustomExtra] = useState('')
  const [cleaners, setCleaners] = useState<string[]>([])
  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sent, setSent] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    supabase.from('cleans').select('*, clients(id, name, email, address, property_type), clean_photos(id, url, room, photo_type)')
      .eq('id', id).single()
      .then(({ data }) => {
        if (!data) return
        setClean(data)
        setClient(data.clients)
        setPhotos(data.clean_photos ?? [])
        setNotes(data.notes ?? '')
        setExtras(data.extras ?? [])
        setCleaners(data.cleaners?.length ? data.cleaners : ['Kinsey'])
        setStartedAt(data.started_at ? toDatetimeLocal(data.started_at) : '')
        setEndedAt(data.ended_at ? toDatetimeLocal(data.ended_at) : '')
        setSent(data.summary_sent ?? false)
      })
  }, [id])

  // Live timer for in-progress cleans
  useEffect(() => {
    if (!clean || clean.ended_at) return
    const startMs = new Date(clean.started_at).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [clean])

  const save = async () => {
    setSaving(true)
    await fetch('/api/cleans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id, notes, extras, cleaners,
        started_at: startedAt ? new Date(startedAt).toISOString() : undefined,
        ended_at: endedAt ? new Date(endedAt).toISOString() : undefined,
      }),
    })
    setSaving(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clean_id', id)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setPhotos(p => [...p, { id: data.id, url: data.url }])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = async (photoId: string) => {
    await supabase.from('clean_photos').delete().eq('id', photoId)
    setPhotos(p => p.filter(x => x.id !== photoId))
  }

  const toggleExtra = (extra: string) =>
    setExtras(prev => prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra])

  const addCustomExtra = () => {
    const val = customExtra.trim()
    if (!val || extras.includes(val)) { setCustomExtra(''); return }
    setExtras(prev => [...prev, val])
    setCustomExtra('')
  }

  const toggleCleaner = (cleaner: string) =>
    setCleaners(prev => prev.includes(cleaner) ? prev.filter(c => c !== cleaner) : [...prev, cleaner])

  const sendReport = async () => {
    if (!client?.email) { alert('This client has no email address.'); return }
    setSending(true)
    await save()
    await fetch(`/api/send-report?clean_id=${id}`)
    setSent(true)
    setSending(false)
  }

  const deleteClean = async () => {
    if (!confirm('Delete this clean? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('cleans').delete().eq('id', id)
    router.push(client?.id ? `/admin/clients/${client.id}` : '/admin')
  }

  if (!clean) return (
    <div style={{ color: 'var(--muted)', padding: 48, textAlign: 'center' }}>Loading...</div>
  )

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const startedAtISO = startedAt ? new Date(startedAt).toISOString() : clean.started_at
  const endedAtISO = endedAt ? new Date(endedAt).toISOString() : clean.ended_at
  const duration = startedAtISO && endedAtISO
    ? Math.round((new Date(endedAtISO).getTime() - new Date(startedAtISO).getTime()) / 60000)
    : null

  const isInProgress = clean.started_at && !clean.ended_at
  const extrasList = client?.property_type === 'commercial' ? COMMERCIAL_EXTRAS : RESIDENTIAL_EXTRAS

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <Link href="/admin/cleans" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em' }}>
            ← All Cleans
          </Link>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28, fontWeight: 600, color: 'var(--teal)', margin: '8px 0 4px' }}>
            Clean — {clean.started_at ? fmtDate(clean.started_at) : 'In Progress'}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {isInProgress && (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat)', background: '#fef9c3', color: '#854d0e' }}>In Progress</span>
            )}
            {!isInProgress && duration !== null && (
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{duration} min · {fmtTime(startedAtISO)} – {fmtTime(endedAtISO)}</span>
            )}
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat)', background: sent ? '#dcfce7' : '#fef9c3', color: sent ? '#166534' : '#854d0e' }}>
              {sent ? 'Summary Sent' : 'Summary Pending'}
            </span>
          </div>
        </div>
        <button onClick={deleteClean} disabled={deleting} title="Delete clean" style={{ background: 'none', border: '1.5px solid var(--line)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'var(--font-montserrat)', fontWeight: 600 }}>
          <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* In-progress banner with live timer */}
      {isInProgress && (
        <div style={{ background: 'var(--teal)', borderRadius: 14, padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>CLEAN IN PROGRESS</div>
            <div style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: 38, fontWeight: 300, color: 'var(--blush)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              {(() => { const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60; return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}` })()}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Started {new Date(clean.started_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
          <a href={`/admin/clean?resume=${id}`} style={{ display: 'inline-block', background: 'var(--blush)', color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 20px', borderRadius: 50, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Resume Clean →
          </a>
        </div>
      )}

      {/* Time editing */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 16 }}>
        <label style={labelStyle}>Clean Time</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Start</div>
            <input type="datetime-local" style={inputStyle} value={startedAt} onChange={e => setStartedAt(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>End</div>
            <input type="datetime-local" style={inputStyle} value={endedAt} onChange={e => setEndedAt(e.target.value)} />
          </div>
        </div>
        {duration !== null && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
            Duration: <strong style={{ color: 'var(--teal)' }}>{duration} min</strong>
          </div>
        )}
      </div>

      {/* Cleaners */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 16 }}>
        <label style={labelStyle}>Who Cleaned</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {CLEANERS.map(cleaner => {
            const checked = cleaners.includes(cleaner)
            return (
              <button key={cleaner} onClick={() => toggleCleaner(cleaner)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: checked ? '2px solid var(--blush)' : '1.5px solid var(--line)', background: checked ? 'var(--blush-bg)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 14, fontWeight: checked ? 600 : 400, color: checked ? 'var(--teal)' : 'var(--muted)', transition: 'all 0.15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: checked ? '2px solid var(--blush)' : '2px solid var(--line)', background: checked ? 'var(--blush)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {checked && <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                {cleaner}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 16 }}>
        <label style={labelStyle}>Clean Notes</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
          placeholder="Notes about this clean..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Extras */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 16 }}>
        <label style={labelStyle}>Extra Services</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {extrasList.map(extra => (
            <button key={extra} onClick={() => toggleExtra(extra)} style={{
              padding: '8px 14px', borderRadius: 20,
              border: extras.includes(extra) ? '1.5px solid var(--blush)' : '1.5px solid var(--line)',
              background: extras.includes(extra) ? 'var(--blush-bg)' : 'white',
              color: extras.includes(extra) ? 'var(--teal)' : 'var(--muted)',
              fontFamily: 'var(--font-outfit), sans-serif', fontSize: 13,
              fontWeight: extras.includes(extra) ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {extras.includes(extra) ? '✓ ' : ''}{extra}
            </button>
          ))}
          {/* Custom extras not in the standard list */}
          {extras.filter(e => !extrasList.includes(e)).map(e => (
            <button key={e} onClick={() => toggleExtra(e)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid var(--blush)', background: 'var(--blush-bg)', color: 'var(--teal)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ✓ {e}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            placeholder="Add custom extra..."
            value={customExtra}
            onChange={e => setCustomExtra(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomExtra()}
          />
          <button onClick={addCustomExtra} style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'white', color: 'var(--teal)', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
        </div>
      </div>

      {/* Photos */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
        <label style={labelStyle}>Photos ({photos.length})</label>
        {photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                <Image src={photo.url} alt="Clean photo" fill style={{ objectFit: 'cover' }} />
                {photo.room && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '3px 6px', fontSize: 10, color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {photo.photo_type === 'before' ? '⬛ ' : photo.photo_type === 'after' ? '✓ ' : ''}{photo.room}
                  </div>
                )}
                <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px dashed var(--line)', background: 'var(--cream)', color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Camera size={16} />{uploading ? 'Uploading...' : 'Add Photos'}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={save} disabled={saving} className="btn-secondary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={sendReport} disabled={sending || !client?.email} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Send size={14} />{sending ? 'Sending...' : sent ? 'Resend Summary' : 'Send Summary'}
        </button>
        <Link href={`/report/${id}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', padding: '10px 16px', border: '1.5px solid var(--line)', borderRadius: 50 }}>
          <ExternalLink size={13} /> Preview Report
        </Link>
      </div>
      {!client?.email && (
        <p style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>Add an email to this client to enable sending summaries.</p>
      )}
    </div>
  )
}
