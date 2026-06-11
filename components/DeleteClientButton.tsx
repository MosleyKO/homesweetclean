'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/clients')
    } else {
      alert('Failed to delete client. Please try again.')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-outfit), sans-serif' }}>
          Delete <strong style={{ color: 'var(--teal)' }}>{clientName}</strong>?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Deleting…' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'white', color: 'var(--muted)', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff5f5', color: '#ef4444', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}
    >
      <Trash2 size={13} />
      Delete
    </button>
  )
}
