import { NextRequest, NextResponse } from 'next/server'

export function requireAdmin(req: NextRequest): NextResponse | null {
  const auth = req.cookies.get('hsc_admin_auth')?.value
  if (auth && auth === process.env.ADMIN_SECRET) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
