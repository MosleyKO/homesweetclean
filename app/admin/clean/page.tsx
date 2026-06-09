'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Camera, X, CheckCircle, ChevronDown } from 'lucide-react'
import Image from 'next/image'

const EXTRAS = [
  'Steam mop floors',
  'Clean inside oven',
  'Clean inside fridge',
  'Wash windows',
  'Change bed linens',
  'Clean inside microwave',
  'Wipe down blinds',
  'Clean garage',
  'Scrub tile grout',
  'Organize pantry',
]

type Phase = 'select' | 'active' | 'done'

interface Client { id: string; name: string; access_notes: string | null; client_notes: string | null }
interface Photo { id: string; url: string }

function CleanFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('client')

  const [phase, setPhase] = useState<Phase>('select')
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [cleanId, setCleanId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [notes, setNotes] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [ending, setEnding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load clients
  useEffect(() => {
    supabase.from('clients').select('id, name, access_notes, client_notes').eq('status', 'active').order('name')
      .then(({ data }) => {
        if (data) {
          setClients(data)
          if (preselectedId) {
            const found = data.find((c: Client) => c.id === preselectedId)
            if (found) setSelectedClient(found)
          }
        }
      })
  }, [preselectedId])

  // Timer
  useEffect(() => {
    if (phase !== 'active' || !startTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, startTime])

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${m}:${String(sec).padStart(2, '0')}`
  }

  const startClean = async () => {
    if (!selectedClient) return
    const res = await fetch('/api/cleans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: selectedClient.id }),
    })
    const data = await res.json()
    setCleanId(data.id)
    setStartTime(new Date(data.started_at))
    setPhase('active')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!cleanId || files.length === 0) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clean_id', cleanId)
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

  const toggleExtra = (extra: string) => {
    setExtras(prev => prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra])
  }

  const endClean = async () => {
    if (!cleanId) return
    setEnding(true)
    await fetch('/api/cleans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cleanId,
        ended_at: new Date().toISOString(),
        notes,
        extras,
      }),
    })
    setPhase('done')
    setEnding(false)
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  // ─── PHASE: SELECT ──────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>New Clean</p>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 30, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Who are we cleaning for?</h1>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--line)', fontSize: 16, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', background: 'white', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              style={{
                background: selectedClient?.id === client.id ? 'var(--blush-bg)' : 'white',
                border: selectedClient?.id === client.id ? '2px solid var(--blush)' : '1.5px solid var(--line)',
                borderRadius: 12,
                padding: '16px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)' }}>{client.name}</div>
              {client.access_notes && (
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>🔑 {client.access_notes}</div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32, fontSize: 14 }}>No clients found.</div>
          )}
        </div>

        {selectedClient && (
          <div style={{ marginTop: 28 }}>
            {selectedClient.client_notes && (
              <div style={{ background: 'var(--cream-warm)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: 'var(--teal)', lineHeight: 1.6 }}>
                <strong>Note:</strong> {selectedClient.client_notes}
              </div>
            )}
            <button onClick={startClean} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '18px' }}>
              Start Clean →
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── PHASE: ACTIVE ──────────────────────────────────────────────────────────
  if (phase === 'active') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Timer header */}
        <div style={{ background: 'var(--teal)', borderRadius: 16, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>CLEANING</div>
          <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 26, fontWeight: 600, color: 'white', marginBottom: 4 }}>{selectedClient?.name}</div>
          <div style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: 48, fontWeight: 300, color: 'var(--blush)', letterSpacing: '0.02em' }}>{formatElapsed(elapsed)}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Started {startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>

        {/* Access codes reminder */}
        {selectedClient?.access_notes && (
          <div style={{ background: 'var(--blush-bg)', border: '1px solid var(--blush-soft)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--teal)' }}>
            🔑 {selectedClient.access_notes}
          </div>
        )}

        {/* Notes */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 16 }}>
          <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>Clean Notes</label>
          <textarea
            style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 15, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', resize: 'vertical', minHeight: 100, outline: 'none', boxSizing: 'border-box' }}
            placeholder="Anything to note about today's clean..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Extras */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 16 }}>
          <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Extra Services</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXTRAS.map(extra => (
              <button
                key={extra}
                onClick={() => toggleExtra(extra)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: extras.includes(extra) ? '1.5px solid var(--blush)' : '1.5px solid var(--line)',
                  background: extras.includes(extra) ? 'var(--blush-bg)' : 'white',
                  color: extras.includes(extra) ? 'var(--teal)' : 'var(--muted)',
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: 13,
                  fontWeight: extras.includes(extra) ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {extras.includes(extra) ? '✓ ' : ''}{extra}
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 24 }}>
          <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Photos</label>

          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {photos.map(photo => (
                <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                  <Image src={photo.url} alt="Clean photo" fill style={{ objectFit: 'cover' }} />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px dashed var(--line)', background: 'var(--cream)', color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Camera size={16} />
            {uploading ? 'Uploading...' : 'Add Photos'}
          </button>
        </div>

        {/* End clean */}
        <button
          onClick={endClean}
          disabled={ending}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '18px', background: 'var(--teal)' }}
        >
          {ending ? 'Finishing...' : 'End Clean →'}
        </button>
      </div>
    )
  }

  // ─── PHASE: DONE ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
      <CheckCircle size={64} color="var(--sage-deep)" strokeWidth={1.25} style={{ margin: '0 auto 20px' }} />
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 30, fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>Clean Complete</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>
        {selectedClient?.name} · {formatElapsed(elapsed)} · {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a href={`/api/send-report?clean_id=${cleanId}`} className="btn-primary" style={{ justifyContent: 'center' }}>
          Send Summary to Client →
        </a>
        <button onClick={() => router.push(`/admin/clients/${selectedClient?.id}`)} className="btn-secondary">
          View Client History
        </button>
        <button onClick={() => { setPhase('select'); setSelectedClient(null); setCleanId(null); setNotes(''); setExtras([]); setPhotos([]); setElapsed(0) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
          Start another clean
        </button>
      </div>
    </div>
  )
}

export default function CleanPage() {
  return (
    <Suspense>
      <CleanFlow />
    </Suspense>
  )
}
