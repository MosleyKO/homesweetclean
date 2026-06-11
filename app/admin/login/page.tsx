'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/admin'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Check if a credential is registered
    fetch('/api/webauthn/auth-options')
      .then(r => { if (r.ok) setHasBiometric(true) })
      .catch(() => {})
  }, [])

  async function handlePasswordSubmit(e: React.FormEvent) {
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
      // Offer biometric setup if not yet registered
      if (!hasBiometric && window.PublicKeyCredential) {
        setShowSetup(true)
        setLoading(false)
      } else {
        window.location.href = res.url || from
      }
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Incorrect password')
      setLoading(false)
    }
  }

  async function handleBiometricLogin() {
    setBiometricLoading(true)
    setError('')
    try {
      const optRes = await fetch('/api/webauthn/auth-options')
      const options = await optRes.json()
      const assertion = await startAuthentication({ optionsJSON: options })
      const verifyRes = await fetch(`/api/webauthn/auth-verify?from=${encodeURIComponent(from)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
        redirect: 'follow',
      })
      if (verifyRes.ok || verifyRes.redirected) {
        window.location.href = verifyRes.url || from
      } else {
        setError('Biometric verification failed. Try your password.')
      }
    } catch {
      setError('Biometric cancelled or unavailable.')
    }
    setBiometricLoading(false)
  }

  async function handleSetupBiometric() {
    try {
      const optRes = await fetch('/api/webauthn/register-options')
      const options = await optRes.json()
      const reg = await startRegistration({ optionsJSON: options })
      const verifyRes = await fetch('/api/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      })
      if (verifyRes.ok) {
        window.location.href = from
      } else {
        setError('Setup failed. Heading to admin anyway.')
        window.location.href = from
      }
    } catch {
      window.location.href = from
    }
  }

  if (showSetup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>🔐</div>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 18, fontWeight: 600, color: 'var(--teal)' }}>
          Set up Face ID?
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
          Skip typing your password next time — use Face ID or Touch ID to sign in instantly.
        </p>
        <button
          onClick={handleSetupBiometric}
          style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', letterSpacing: '0.06em', cursor: 'pointer', marginTop: 4 }}
        >
          Set Up Face ID / Touch ID
        </button>
        <button
          onClick={() => { window.location.href = from }}
          style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', padding: 8 }}
        >
          Skip for now
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasBiometric && (
        <>
          <button
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
            style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', letterSpacing: '0.06em', cursor: biometricLoading ? 'not-allowed' : 'pointer', opacity: biometricLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>🔐</span>
            {biometricLoading ? 'Verifying…' : 'Sign in with Face ID / Touch ID'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.06em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
        </>
      )}

      <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus={!hasBiometric}
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
          style={{ background: hasBiometric ? 'white' : 'var(--teal)', color: hasBiometric ? 'var(--teal)' : 'white', border: hasBiometric ? '1.5px solid var(--line)' : 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-montserrat), sans-serif', letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in…' : 'Sign In with Password'}
        </button>
      </form>
    </div>
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
