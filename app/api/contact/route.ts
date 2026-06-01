import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, phone, service, bedrooms, message } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Home Sweet Clean <quotes@homesweetclean.co>",
      to: "hello@homesweetclean.co",
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1F4E5F;">
          <div style="background: #1F4E5F; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Quote Request</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Home Sweet Clean</p>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #E8DDD6; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6; font-weight: 600; width: 140px;">Name</td><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6;">${name}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6; font-weight: 600;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6; font-weight: 600;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6;">${phone || "Not provided"}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6; font-weight: 600;">Service</td><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6;">${service || "Not selected"}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6; font-weight: 600;">Bedrooms</td><td style="padding: 12px 0; border-bottom: 1px solid #E8DDD6;">${bedrooms || "Not selected"}</td></tr>
              <tr><td style="padding: 12px 0; font-weight: 600; vertical-align: top;">Message</td><td style="padding: 12px 0;">${message || "None"}</td></tr>
            </table>
            <div style="margin-top: 28px; padding: 20px; background: #FCEFEC; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
