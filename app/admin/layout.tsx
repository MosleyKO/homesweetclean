'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, Sparkles } from 'lucide-react'
import Image from 'next/image'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/clean', label: 'Start Clean', icon: Sparkles },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--teal)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Image src='/logo-wordmark.png' alt='Home Sweet Clean' width={160} height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <Link href='/' style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-montserrat), sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--teal)',
          background: 'white',
          textDecoration: 'none',
          padding: '8px 16px',
          borderRadius: 50,
          transition: 'opacity 0.15s',
        }}>
          ← Back to Site
        </Link>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220,
          background: 'white',
          borderRight: '1px solid var(--line)',
          padding: '24px 0',
          position: 'sticky',
          top: 60,
          height: 'calc(100vh - 60px)',
          flexShrink: 0,
        }}>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 24px',
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textDecoration: 'none',
                color: active ? 'var(--teal)' : 'var(--muted)',
                background: active ? 'var(--blush-bg)' : 'transparent',
                borderRight: active ? '3px solid var(--blush)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
