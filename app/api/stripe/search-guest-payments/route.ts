import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email || email.length < 3) return NextResponse.json({ charges: [] });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Fetch recent charges and filter by receipt_email on our side
    // (Stripe search API doesn't support receipt_email as a query field)
    const results = await stripe.charges.list({ limit: 100 });

    const emailLower = email.toLowerCase();
    const charges = results.data
      .filter(c => {
        const receiptEmail = ((c as any).receipt_email ?? '').toLowerCase();
        const billingEmail = (c.billing_details?.email ?? '').toLowerCase();
        const hasNoCustomer = !(c as any).customer;
        return hasNoCustomer && (receiptEmail.includes(emailLower) || billingEmail.includes(emailLower));
      })
      .map(c => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        description: c.description ?? null,
        receipt_email: (c as any).receipt_email ?? c.billing_details?.email ?? null,
        receipt_url: c.receipt_url ?? null,
        payment_date: new Date(c.created * 1000).toISOString(),
      }));

    return NextResponse.json({ charges });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe guest payment search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
