'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/admin'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/admin-login?from=${encodeURIComponent(from)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      redirect: 'follow',
    })

    if (res.ok || res.redirected) {
      window.location.href = res.url || from
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Incorrect password')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          required
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--line)', fontSize: 15, color: 'var(--teal)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-outfit), sans-serif' }}
        />
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-outfit), sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 26, fontWeight: 600, color: 'var(--teal)' }}>
            Home <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 32 }}>Sweet</span> Clean
          </div>
          <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 6 }}>
            Admin Access
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--line)', padding: 32 }}>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
