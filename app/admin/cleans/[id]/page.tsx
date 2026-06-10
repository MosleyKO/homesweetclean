'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, X, Trash2, Send, ExternalLink } from 'lucide-react'

const EXTRAS = [
  'Steam mop floors', 'Clean inside oven', 'Clean inside fridge',
  'Wash windows', 'Change bed linens', 'Clean inside microwave',
  'Wipe down blinds', 'Clean garage', 'Scrub tile grout', 'Organize pantry',
]

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

export default function CleanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clean, setClean] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.from('cleans').select('*, clients(id, name, email, address), clean_photos(id, url)')
      .eq('id', id).single()
      .then(({ data }) => {
        if (!data) return
        setClean(data)
        setClient(data.clients)
        setPhotos(data.clean_photos ?? [])
        setNotes(data.notes ?? '')
        setExtras(data.extras ?? [])
        setSent(data.summary_sent ?? false)
      })
  }, [id])

  const save = async () => {
    setSaving(true)
    await fetch('/api/cleans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes, extras }),
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
  const duration = clean.started_at && clean.ended_at
    ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
    : null

  const isInProgress = clean.started_at && !clean.ended_at

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <Link href={`/admin/clients/${client?.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em' }}>
            ← {client?.name ?? 'CLIENT'}
          </Link>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 28, fontWeight: 600, color: 'var(--teal)', margin: '8px 0 4px' }}>
            Clean — {clean.started_at ? fmtDate(clean.started_at) : 'In Progress'}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {isInProgress && (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat)', background: '#fef9c3', color: '#854d0e' }}>In Progress</span>
            )}
            {!isInProgress && duration !== null && (
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{duration} min · {fmtTime(clean.started_at)} – {fmtTime(clean.ended_at)}</span>
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
          {EXTRAS.map(extra => (
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
