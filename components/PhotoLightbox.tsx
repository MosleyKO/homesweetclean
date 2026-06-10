'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo { id: string; url: string }

export default function PhotoLightbox({ photos, columns = 2 }: { photos: Photo[], columns?: number }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex(i => (i + 1) % photos.length)

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            onClick={() => { setIndex(i); setOpen(true) }}
            style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in' }}
          >
            <Image src={photo.url} alt={`Clean photo ${i + 1}`} fill style={{ objectFit: 'cover', transition: 'transform 0.2s' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }} className="photo-overlay" />
          </div>
        ))}
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          onKeyDown={handleKey}
          tabIndex={0}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
          autoFocus
        >
          {/* Close */}
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
            <X size={18} color="white" />
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
            {index + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={22} color="white" />
            </button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', width: '100%', height: '100%' }}>
            <Image
              src={photos[index].url}
              alt={`Clean photo ${index + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={22} color="white" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
