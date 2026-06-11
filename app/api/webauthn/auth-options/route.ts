import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RP_ID = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '').replace('http://', '').split('/')[0] ?? 'localhost'

export async function GET() {
  const { data: creds } = await supabaseAdmin.from('webauthn_credentials').select('credential_id')

  if (!creds || creds.length === 0) {
    return NextResponse.json({ error: 'No credentials registered' }, { status: 404 })
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    allowCredentials: creds.map(c => ({ id: c.credential_id })),
  })

  const res = NextResponse.json(options)
  res.cookies.set('webauthn_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })
  return res
}
