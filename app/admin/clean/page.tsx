'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Camera, X, CheckCircle, Key } from 'lucide-react'
import Image from 'next/image'

const EXTRAS = [
  'Steam mop floors', 'Clean inside oven', 'Clean inside fridge',
  'Wash windows', 'Change bed linens', 'Clean inside microwave',
  'Wipe down blinds', 'Clean garage', 'Scrub tile grout', 'Organize pantry',
]

const ROOMS = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Office', 'Entry', 'Hallway', 'Laundry Room', 'Dining Room', 'Other']

type Phase = 'select' | 'active' | 'done'
interface Client { id: string; name: string; access_notes: string | null; client_notes: string | null; property_type: string }
interface Photo { id: string; url: string; room: string | null; photo_type: string | null }

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
  const [noticed, setNoticed] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingNoticed, setUploadingNoticed] = useState(false)
  const [ending, setEnding] = useState(false)
  // Photo tag modal state
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [tagRoom, setTagRoom] = useState('Kitchen')
  const [tagCustomRoom, setTagCustomRoom] = useState('')
  const [tagType, setTagType] = useState<'before' | 'after'>('before')
  const [showTagModal, setShowTagModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const noticedFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('clients').select('id, name, access_notes, client_notes, property_type').eq('status', 'active').order('name')
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

  useEffect(() => {
    if (phase !== 'active' || !startTime) return
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [phase, startTime])

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
  }

  const startClean = async () => {
    if (!selectedClient) return
    const res = await fetch('/api/cleans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: selectedClient.id }) })
    const data = await res.json()
    setCleanId(data.id)
    setStartTime(new Date(data.started_at))
    setPhase('active')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPendingFiles(files)
    setTagRoom('Kitchen')
    setTagCustomRoom('')
    setTagType('before')
    setShowTagModal(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  const uploadWithTags = async () => {
    if (!cleanId) return
    setShowTagModal(false)
    setUploading(true)
    const roomLabel = tagRoom === 'Other' ? (tagCustomRoom.trim() || 'Other') : tagRoom
    for (const file of pendingFiles) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clean_id', cleanId)
      fd.append('room', roomLabel)
      fd.append('photo_type', tagType)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setPhotos(p => [...p, { id: data.id, url: data.url, room: roomLabel, photo_type: tagType }])
    }
    setUploading(false)
    setPendingFiles([])
  }

  const handleNoticedPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!cleanId || !files.length) return
    setUploadingNoticed(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clean_id', cleanId)
      fd.append('room', 'Noticed')
      fd.append('photo_type', 'noticed')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setPhotos(p => [...p, { id: data.id, url: data.url, room: 'Noticed', photo_type: 'noticed' }])
    }
    setUploadingNoticed(false)
    if (noticedFileRef.current) noticedFileRef.current.value = ''
  }

  const removePhoto = async (photoId: string) => {
    await supabase.from('clean_photos').delete().eq('id', photoId)
    setPhotos(p => p.filter(x => x.id !== photoId))
  }

  const toggleExtra = (extra: string) =>
    setExtras(prev => prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra])

  const endClean = async () => {
    if (!cleanId) return
    setEnding(true)
    await fetch('/api/cleans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cleanId, ended_at: new Date().toISOString(), notes, noticed, extras }),
    })
    setPhase('done')
    setEnding(false)
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  // ── SELECT ──
  if (phase === 'select') return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>New Clean</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 30, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Who are we cleaning for?</h1>
      </div>
      <input style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--line)', fontSize: 16, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', background: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(client => (
          <button key={client.id} onClick={() => setSelectedClient(client)} style={{ background: selectedClient?.id === client.id ? 'var(--blush-bg)' : 'white', border: selectedClient?.id === client.id ? '2px solid var(--blush)' : '1.5px solid var(--line)', borderRadius: 12, padding: '16px 20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)' }}>{client.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{client.property_type}</div>
            {client.access_notes && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}><Key size={13} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />{client.access_notes}</div>}
          </button>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32, fontSize: 14 }}>No clients found.</div>}
      </div>
      {selectedClient?.client_notes && (
        <div style={{ background: 'var(--cream-warm)', borderRadius: 12, padding: '14px 16px', marginTop: 16, fontSize: 14, color: 'var(--teal)', lineHeight: 1.6 }}><strong>Note:</strong> {selectedClient.client_notes}</div>
      )}

      {/* Fixed Start Clean bar — appears above bottom nav when client selected */}
      {selectedClient && (
        <div style={{ position: 'fixed', bottom: 70, left: 0, right: 0, padding: '12px 16px', background: 'white', borderTop: '1px solid var(--line)', zIndex: 40 }}>
          <button onClick={startClean} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: 16 }}>
            Start Clean for {selectedClient.name} →
          </button>
        </div>
      )}
    </div>
  )

  // ── ACTIVE ──
  if (phase === 'active') return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Tag modal */}
      {showTagModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 24px', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 600, color: 'var(--teal)', margin: '0 0 20px' }}>Tag {pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''}</h3>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Room</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ROOMS.map(r => (
                  <button key={r} onClick={() => setTagRoom(r)} style={{ padding: '7px 14px', borderRadius: 20, border: tagRoom === r ? '1.5px solid var(--blush)' : '1.5px solid var(--line)', background: tagRoom === r ? 'var(--blush-bg)' : 'white', color: tagRoom === r ? 'var(--teal)' : 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 13, fontWeight: tagRoom === r ? 600 : 400, cursor: 'pointer' }}>{r}</button>
                ))}
              </div>
              {tagRoom === 'Other' && (
                <input style={{ marginTop: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter room name..." value={tagCustomRoom} onChange={e => setTagCustomRoom(e.target.value)} autoFocus />
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Before or After?</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['before', 'after'] as const).map(t => (
                  <button key={t} onClick={() => setTagType(t)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: tagType === t ? '2px solid var(--blush)' : '1.5px solid var(--line)', background: tagType === t ? 'var(--blush-bg)' : 'white', fontFamily: 'var(--font-fraunces), serif', fontSize: 16, fontWeight: 600, color: tagType === t ? 'var(--teal)' : 'var(--muted)', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowTagModal(false); setPendingFiles([]) }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={uploadWithTags} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Upload Photos</button>
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      <div style={{ background: 'var(--teal)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>CLEANING</div>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 26, fontWeight: 600, color: 'white', marginBottom: 4 }}>{selectedClient?.name}</div>
        <div style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: 48, fontWeight: 300, color: 'var(--blush)', letterSpacing: '0.02em' }}>{formatElapsed(elapsed)}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Started {startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
      </div>

      {selectedClient?.access_notes && (
        <div style={{ background: 'var(--blush-bg)', border: '1px solid var(--blush-soft)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'flex-start', gap: 8 }}><Key size={14} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />{selectedClient.access_notes}</div>
      )}

      {/* Notes */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 16 }}>
        <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>Clean Notes</label>
        <textarea style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 15, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }} placeholder="General notes about today's clean..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Things Noticed */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 16 }}>
        <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Things We Noticed</label>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, fontFamily: 'var(--font-outfit), sans-serif' }}>Stains, damage, items to flag for the client</p>
        <textarea style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 15, fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--teal)', resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} placeholder="e.g. Scuff mark on hallway wall, soap scum build-up in master bath..." value={noticed} onChange={e => setNoticed(e.target.value)} />
        {/* Noticed photos */}
        {photos.filter(p => p.photo_type === 'noticed').length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            {photos.filter(p => p.photo_type === 'noticed').map(photo => (
              <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                <Image src={photo.url} alt="Noticed" fill style={{ objectFit: 'cover' }} />
                <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input ref={noticedFileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleNoticedPhoto} style={{ display: 'none' }} />
        <button onClick={() => noticedFileRef.current?.click()} disabled={uploadingNoticed} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '2px dashed var(--blush-soft)', background: 'var(--blush-bg)', color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-outfit), sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Camera size={14} />{uploadingNoticed ? 'Uploading...' : 'Add Photo of Issue'}
        </button>
      </div>

      {/* Extras */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 20, marginBottom: 16 }}>
        <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 12 }}>Extra Services</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXTRAS.map(extra => (
            <button key={extra} onClick={() => toggleExtra(extra)} style={{ padding: '8px 14px', borderRadius: 20, border: extras.includes(extra) ? '1.5px solid var(--blush)' : '1.5px solid var(--line)', background: extras.includes(extra) ? 'var(--blush-bg)' : 'white', color: extras.includes(extra) ? 'var(--teal)' : 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif', fontSize: 13, fontWeight: extras.includes(extra) ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
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
                {photo.room && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '3px 6px', fontSize: 10, color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {photo.photo_type === 'before' ? '⬛ ' : '✓ '}{photo.room}
                  </div>
                )}
                <button onClick={() => removePhoto(photo.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleFileSelect} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px dashed var(--line)', background: 'var(--cream)', color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-outfit), sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Camera size={16} />{uploading ? 'Uploading...' : 'Add Photos'}
        </button>
      </div>

      <button onClick={endClean} disabled={ending} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: 18, background: 'var(--teal)' }}>
        {ending ? 'Finishing...' : 'End Clean →'}
      </button>
    </div>
  )

  // ── DONE ──
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
      <CheckCircle size={64} color="var(--sage-deep)" strokeWidth={1.25} style={{ margin: '0 auto 20px' }} />
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 30, fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>Clean Complete</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>{selectedClient?.name} · {formatElapsed(elapsed)} · {photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a href={`/api/send-report?clean_id=${cleanId}`} className="btn-primary" style={{ justifyContent: 'center' }}>Send Summary to Client →</a>
        <button onClick={() => router.push(`/admin/clients/${selectedClient?.id}`)} className="btn-secondary">View Client History</button>
        <button onClick={() => { setPhase('select'); setSelectedClient(null); setCleanId(null); setNotes(''); setNoticed(''); setExtras([]); setPhotos([]); setElapsed(0) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>Start another clean</button>
      </div>
    </div>
  )
}

export default function CleanPage() {
  return <Suspense><CleanFlow /></Suspense>
}
