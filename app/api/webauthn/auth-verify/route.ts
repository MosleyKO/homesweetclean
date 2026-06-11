import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RP_ID = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '').replace('https://', '').replace('http://', '').split('/')[0] ?? 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const challenge = req.cookies.get('webauthn_challenge')?.value
  if (!challenge) return NextResponse.json({ error: 'No challenge' }, { status: 400 })

  const body = await req.json()
  const from = req.nextUrl.searchParams.get('from') ?? '/admin'

  const { data: cred } = await supabaseAdmin
    .from('webauthn_credentials')
    .select('*')
    .eq('credential_id', body.id)
    .single()

  if (!cred) return NextResponse.json({ error: 'Credential not found' }, { status: 404 })

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
    credential: {
      id: cred.credential_id,
      publicKey: Buffer.from(cred.public_key, 'base64'),
      counter: cred.counter,
    },
  })

  if (!verification.verified) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
  }

  // Update counter
  await supabaseAdmin
    .from('webauthn_credentials')
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq('credential_id', cred.credential_id)

  const res = NextResponse.redirect(new URL(from, req.url))
  res.cookies.set('hsc_admin_auth', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  res.cookies.delete('webauthn_challenge')
  return res
}
