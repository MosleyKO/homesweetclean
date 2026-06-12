import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const deny = requireAdmin(req); if (deny) return deny
  const { client_id } = await req.json()
  if (!client_id) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 })

  // Reuse existing token if one exists
  const { data: existing } = await supabaseAdmin
    .from('client_tokens')
    .select('token')
    .eq('client_id', client_id)
    .single()

  if (existing) return NextResponse.json({ token: existing.token })

  const token = crypto.randomBytes(24).toString('hex')
  const { error } = await supabaseAdmin.from('client_tokens').insert([{ client_id, token }])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token })
}
