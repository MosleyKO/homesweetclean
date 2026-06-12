import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Create a new clean (start)
export async function POST(req: NextRequest) {
  const { client_id } = await req.json()
  const { data, error } = await supabase
    .from('cleans')
    .insert([{ client_id, started_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Update a clean (end, notes, extras, noticed)
export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const allowed = ['started_at', 'ended_at', 'notes', 'extras', 'noticed', 'cleaners', 'summary_sent', 'summary_sent_at']
  const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))
  const { data, error } = await supabase
    .from('cleans')
    .update(safe)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
