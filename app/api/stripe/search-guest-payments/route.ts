import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email || email.length < 3) return NextResponse.json({ charges: [] });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Search charges by receipt_email where no customer is attached
    const results = await stripe.charges.search({
      query: `receipt_email:"${email}"`,
      limit: 50,
    });

    const charges = results.data
      .filter(c => !( c as any).customer)
      .map(c => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        description: c.description ?? null,
        receipt_email: (c as any).receipt_email ?? null,
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
