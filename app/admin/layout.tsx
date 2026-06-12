'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, Sparkles, Kanban, ClipboardList } from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/cleans', label: 'Cleans', icon: ClipboardList, desktopOnly: true },
  { href: '/admin/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/admin/clean', label: 'Start Clean', icon: Sparkles },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .admin-sidebar { display: flex; }
        .admin-bottom-nav { display: none; }
        .admin-main { padding: 32px; }

        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
          .admin-bottom-nav { display: flex; }
          .admin-main { padding: 20px 16px 90px; }
          .admin-header-logo { font-size: 17px !important; }
          .admin-header-logo span { font-size: 22px !important; }
        }
      `}</style>

      {/* Top bar */}
      <header style={{
        background: 'var(--teal)',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        <span className="admin-header-logo" style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, color: 'white', fontWeight: 600, letterSpacing: '-0.01em' }}>
          Home <span style={{ fontFamily: 'var(--font-allura), cursive', color: 'var(--blush)', fontSize: 26, fontWeight: 400 }}>Sweet</span> Clean
        </span>
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
          padding: '7px 14px',
          borderRadius: 50,
        }}>
          ← Back to Site
        </Link>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar — desktop only */}
        <aside className="admin-sidebar" style={{
          width: 220,
          background: 'white',
          borderRight: '1px solid var(--line)',
          padding: '24px 0',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)',
          flexShrink: 0,
          flexDirection: 'column',
        }}>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && (pathname.startsWith(href + '/') || pathname === href))
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
              }}>
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </aside>

        {/* Main content */}
        <main className="admin-main" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="admin-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: 'white',
        borderTop: '1px solid var(--line)',
        zIndex: 50,
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {nav.filter(item => !item.desktopOnly).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? 'var(--teal)' : 'var(--muted)',
              background: active ? 'var(--blush-bg)' : 'transparent',
              borderTop: active ? '2px solid var(--blush)' : '2px solid transparent',
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              <Icon size={20} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
