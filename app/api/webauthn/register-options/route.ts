import { generateRegistrationOptions } from '@simplewebauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

const RP_NAME = 'Home Sweet Clean'
const RP_ID = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '').replace('http://', '').split('/')[0] ?? 'localhost'

export async function GET(req: NextRequest) {
  const deny = requireAdmin(req); if (deny) return deny
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: 'admin',
    userDisplayName: 'HSC Admin',
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
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
