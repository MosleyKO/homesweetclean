'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1.5px solid var(--line)',
  fontSize: 15,
  fontFamily: 'var(--font-outfit), sans-serif',
  color: 'var(--teal)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  fontFamily: 'var(--font-montserrat), sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: 6,
  display: 'block',
}

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    frequency: '',
    status: 'active',
    access_notes: '',
    client_notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('clients').insert([form])
    if (!error) {
      router.push('/admin/clients')
    } else {
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Clients</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>Add New Client</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '28px', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 20, marginTop: 0 }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seven Oaks" />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@email.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(435) 555-0000" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, St. George, UT" />
          </div>
          <div>
            <label style={labelStyle}>Cleaning Frequency</label>
            <select style={inputStyle} value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              <option value="">Select frequency</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="One-time">One-time</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: '28px', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 6, marginTop: 0 }}>Access & Notes</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Alarm codes, garage codes, gate codes — shown at the start of every clean.</p>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Access Notes / Codes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.access_notes} onChange={e => set('access_notes', e.target.value)} placeholder="Alarm code: 1234. Disarm on entry, re-arm on exit." />
          </div>
          <div>
            <label style={labelStyle}>Client Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.client_notes} onChange={e => set('client_notes', e.target.value)} placeholder="Prefers eco-friendly products. Has a dog — keep door closed." />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Client'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
