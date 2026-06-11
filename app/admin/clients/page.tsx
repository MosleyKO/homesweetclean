import { supabase } from '@/lib/supabase'
import ClientsMobileView from '@/components/ClientsMobileView'
import ClientsDesktopView from '@/components/ClientsDesktopView'

export const revalidate = 0

export default async function ClientsPage() {
  const [{ data: clients }, { data: recentCleans }, { data: allInvoices }] = await Promise.all([
    supabase.from('clients').select('*').neq('status', 'lead').order('name', { ascending: true }),
    supabase.from('cleans').select('client_id, started_at').order('started_at', { ascending: false }),
    supabase.from('invoices').select('client_id, status, invoice_created_at').order('invoice_created_at', { ascending: false }),
  ])

  // Last clean per client
  const lastCleanMap: Record<string, string> = {}
  for (const clean of recentCleans ?? []) {
    if (clean.client_id && !lastCleanMap[clean.client_id]) {
      lastCleanMap[clean.client_id] = clean.started_at
    }
  }

  // Latest invoice status per client
  const latestInvoiceMap: Record<string, string> = {}
  for (const inv of allInvoices ?? []) {
    if (inv.client_id && !latestInvoiceMap[inv.client_id]) {
      latestInvoiceMap[inv.client_id] = inv.status
    }
  }

  const allClients = clients ?? []
  const total = allClients.length
  const active = allClients.filter(c => c.status === 'active').length
  const weekly = allClients.filter(c => (c.frequency ?? '').toLowerCase().includes('week')).length
  const monthly = allClients.filter(c => (c.frequency ?? '').toLowerCase().includes('month')).length

  const desktopClients = allClients.map(c => ({
    id: c.id,
    name: c.name,
    address: c.address,
    phone: c.phone,
    status: c.status,
    frequency: c.frequency,
    lastClean: lastCleanMap[c.id] ?? null,
    latestInvoiceStatus: latestInvoiceMap[c.id] ?? null,
  }))

  const mobileClients = allClients.map(c => ({
    id: c.id,
    name: c.name,
    address: c.address,
    phone: c.phone,
    status: c.status,
    lastClean: lastCleanMap[c.id] ?? null,
  }))

  return (
    <div>
      <style>{`
        .clients-desktop { display: block; }
        .clients-mobile { display: none; }
        @media (max-width: 768px) {
          .clients-desktop { display: none; }
          .clients-mobile { display: block; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Manage</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: '0 0 4px' }}>Clients</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>View and manage all of your clients.</p>
      </div>

      {/* Desktop layout */}
      <div className="clients-desktop">
        <ClientsDesktopView
          clients={desktopClients}
          total={total}
          active={active}
          weekly={weekly}
          monthly={monthly}
        />
      </div>

      {/* Mobile layout */}
      <div className="clients-mobile">
        <ClientsMobileView clients={mobileClients} total={total} active={active} inactive={allClients.filter(c => c.status === 'inactive').length} />
      </div>
    </div>
  )
}
