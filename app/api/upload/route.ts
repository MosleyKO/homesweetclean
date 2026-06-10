import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const cleanId = formData.get('clean_id') as string

  if (!file || !cleanId) return NextResponse.json({ error: 'Missing file or clean_id' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${cleanId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('clean-photos')
    .upload(filename, file, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from('clean-photos').getPublicUrl(filename)

  const room = formData.get('room') as string | null
  const photoType = formData.get('photo_type') as string | null

  const { data, error } = await supabase
    .from('clean_photos')
    .insert([{ clean_id: cleanId, url: publicUrl, room: room || null, photo_type: photoType || null }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
