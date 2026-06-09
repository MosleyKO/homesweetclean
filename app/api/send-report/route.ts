import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.homesweetclean.co'

export async function GET(req: NextRequest) {
  const cleanId = req.nextUrl.searchParams.get('clean_id')
  if (!cleanId) return NextResponse.json({ error: 'Missing clean_id' }, { status: 400 })

  const { data: clean } = await supabase
    .from('cleans')
    .select('*, clients(name, email, address)')
    .eq('id', cleanId)
    .single()

  if (!clean) return NextResponse.json({ error: 'Clean not found' }, { status: 404 })

  const client = clean.clients as any
  if (!client?.email) return NextResponse.json({ error: 'Client has no email address' }, { status: 400 })

  const reportUrl = `${BASE_URL}/report/${cleanId}`
  const firstName = client.name?.split(' ')[0] ?? 'there'

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const duration = clean.started_at && clean.ended_at
    ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
    : null

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FBF7F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:24px;font-weight:700;color:#1F4E5F;">
        Home Sweet Clean
      </div>
      <div style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-top:4px;">
        Clean Summary
      </div>
    </div>

    <!-- Main card -->
    <div style="background:white;border-radius:16px;border:1px solid #E8DDD6;padding:32px;margin-bottom:16px;text-align:center;">
      <div style="width:52px;height:52px;border-radius:50%;background:#FCEFEC;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:24px;">✓</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#1F4E5F;margin:0 0 8px;">Your home is clean, ${firstName}!</h1>
      <p style="color:#6B7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Here's a summary of today's clean${client.address ? ` at ${client.address}` : ''}.
      </p>
      <div style="display:table;width:100%;border-collapse:separate;border-spacing:8px;">
        <div style="display:table-row;">
          ${[
            { label: 'Date', value: clean.started_at ? fmtDate(clean.started_at) : '—' },
            { label: 'Time', value: clean.started_at && clean.ended_at ? `${fmtTime(clean.started_at)} – ${fmtTime(clean.ended_at)}` : '—' },
            { label: 'Duration', value: duration ? `${duration} min` : '—' },
          ].map(({ label, value }) => `
          <div style="display:table-cell;background:#FBF7F4;border-radius:10px;padding:12px 8px;text-align:center;">
            <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6B7280;margin-bottom:4px;">${label}</div>
            <div style="font-size:13px;font-weight:700;color:#1F4E5F;line-height:1.3;">${value}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    ${clean.extras && clean.extras.length > 0 ? `
    <!-- Extras -->
    <div style="background:white;border-radius:14px;border:1px solid #E8DDD6;padding:24px;margin-bottom:16px;">
      <div style="font-size:15px;font-weight:700;color:#1F4E5F;margin-bottom:12px;">Extra Services Completed</div>
      <div>${(clean.extras as string[]).map(e => `<span style="display:inline-block;margin:3px 4px;padding:5px 12px;background:#FCEFEC;border-radius:20px;font-size:13px;color:#1F4E5F;">✓ ${e}</span>`).join('')}</div>
    </div>` : ''}

    ${clean.notes ? `
    <!-- Notes -->
    <div style="background:white;border-radius:14px;border:1px solid #E8DDD6;padding:24px;margin-bottom:16px;">
      <div style="font-size:15px;font-weight:700;color:#1F4E5F;margin-bottom:8px;">Notes from Your Cleaner</div>
      <p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0;">${clean.notes}</p>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin:24px 0;">
      <a href="${reportUrl}" style="display:inline-block;background:#E8A6A6;color:white;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:14px 32px;border-radius:50px;text-decoration:none;">
        View Full Report with Photos →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#1F4E5F;border-radius:14px;padding:24px;text-align:center;margin-top:8px;">
      <p style="color:white;font-size:16px;font-weight:700;margin:0 0 6px;">Thank you for trusting us! ♥</p>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 14px;line-height:1.6;">
        We hope you enjoy coming home to a fresh, clean space.
      </p>
      <a href="mailto:hello@homesweetclean.co" style="color:#E8A6A6;font-size:12px;font-weight:600;text-decoration:none;">hello@homesweetclean.co</a>
    </div>

  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Home Sweet Clean <hello@homesweetclean.co>',
    to: client.email,
    subject: `Your clean summary — ${clean.started_at ? fmtDate(clean.started_at) : 'Today'}`,
    html,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark summary as sent
  await supabase.from('cleans').update({ summary_sent: true, summary_sent_at: new Date().toISOString() }).eq('id', cleanId)

  // Redirect to the report page so the user can see it was sent
  return NextResponse.redirect(`${BASE_URL}/report/${cleanId}?sent=1`)
}
