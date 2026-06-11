import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import PipelineBoard from '@/components/PipelineBoard'

export const revalidate = 0

export default async function PipelinePage() {
  const { data: leads } = await supabase
    .from('clients')
    .select('id, name, email, phone, address, property_type, frequency, bedrooms, source, source_detail, pipeline_stage, created_at')
    .eq('status', 'lead')
    .order('created_at', { ascending: false })

  const total = leads?.length ?? 0
  const byStage: Record<string, number> = {}
  for (const l of leads ?? []) {
    byStage[l.pipeline_stage] = (byStage[l.pipeline_stage] ?? 0) + 1
  }

  return (
    <div>
      <style>{`
        .pipeline-stats { display: flex; gap: 12; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Sales</p>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 32, fontWeight: 600, color: 'var(--teal)', margin: '0 0 4px' }}>Pipeline</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            {total} active {total === 1 ? 'lead' : 'leads'}
          </p>
        </div>
        <Link href='/admin/clients/new' className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <UserPlus size={15} /> Add Lead
        </Link>
      </div>

      {total === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center', background: 'white',
          borderRadius: 14, border: '1px solid var(--line)',
        }}>
          <p style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, color: 'var(--teal)', marginBottom: 8 }}>
            No leads yet
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
            Leads from your quote form will appear here automatically.
          </p>
          <Link href='/admin/clients/new' className='btn-primary' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={15} /> Add Manually
          </Link>
        </div>
      ) : (
        <PipelineBoard leads={leads ?? []} />
      )}
    </div>
  )
}
