import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RP_ID = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '').replace('http://', '').split('/')[0] ?? 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const challenge = req.cookies.get('webauthn_challenge')?.value
  if (!challenge) return NextResponse.json({ error: 'No challenge' }, { status: 400 })

  const body = await req.json()

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  const { credential } = verification.registrationInfo

  // Remove any old credentials and store the new one
  await supabaseAdmin.from('webauthn_credentials').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('webauthn_credentials').insert([{
    credential_id: credential.id,
    public_key: Buffer.from(credential.publicKey).toString('base64'),
    counter: credential.counter,
  }])

  const res = NextResponse.json({ verified: true })
  res.cookies.delete('webauthn_challenge')
  return res
}
