'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { X, Plus } from 'lucide-react'

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

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    frequency: '', status: 'active', property_type: 'residential',
    access_notes: '', client_notes: '', emails: [] as string[],
  })

  useEffect(() => {
    supabase.from('clients').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        frequency: data.frequency ?? '',
        status: data.status ?? 'active',
        property_type: data.property_type ?? 'residential',
        access_notes: data.access_notes ?? '',
        client_notes: data.client_notes ?? '',
        emails: data.emails ?? [],
      })
      setLoading(false)
    })
  }, [id])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const addEmail = () => {
    const e = newEmail.trim().toLowerCase()
    if (!e || form.emails.includes(e)) return
    setForm(f => ({ ...f, emails: [...f.emails, e] }))
    setNewEmail('')
  }

  const removeEmail = (email: string) =>
    setForm(f => ({ ...f, emails: f.emails.filter(e => e !== email) }))

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('clients').update(form).eq('id', id)
    if (!error) router.push(`/admin/clients/${id}`)
    else { alert('Something went wrong.'); setSaving(false) }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: 48 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Edit Client</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: 0 }}>{form.name}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 20, marginTop: 0 }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} required value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Property Type</label>
              <select style={inputStyle} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Frequency</label>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Primary Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>

        {/* Additional emails */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 6, marginTop: 0 }}>Additional Emails</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Summaries will be sent to all emails listed here plus the primary email above.</p>
          {form.emails.map(email => (
            <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--cream)', fontSize: 14, color: 'var(--teal)', fontFamily: 'var(--font-outfit), sans-serif' }}>{email}</div>
              <button type="button" onClick={() => removeEmail(email)} style={{ background: 'none', border: '1.5px solid var(--line)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={14} color="var(--muted)" />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="email"
              placeholder="manager@severoaks.com"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail() } }}
            />
            <button type="button" onClick={addEmail} style={{ background: 'var(--teal)', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Access & notes */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--line)', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 17, fontWeight: 600, color: 'var(--teal)', marginBottom: 20, marginTop: 0 }}>Access & Notes</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Access Notes / Codes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.access_notes} onChange={e => set('access_notes', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Client Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.client_notes} onChange={e => set('client_notes', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
