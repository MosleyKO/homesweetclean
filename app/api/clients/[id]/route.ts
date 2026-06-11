import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Delete related records first (clean_photos → cleans → client_tokens → clients)
  const { data: cleans } = await supabaseAdmin.from('cleans').select('id').eq('client_id', id)
  const cleanIds = (cleans ?? []).map((c: any) => c.id)

  if (cleanIds.length > 0) {
    await supabaseAdmin.from('clean_photos').delete().in('clean_id', cleanIds)
    await supabaseAdmin.from('cleans').delete().in('id', cleanIds)
  }

  await supabaseAdmin.from('client_tokens').delete().eq('client_id', id)
  await supabaseAdmin.from('invoices').delete().eq('client_id', id)

  const { error } = await supabaseAdmin.from('clients').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
