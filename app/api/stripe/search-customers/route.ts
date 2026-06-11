import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q || q.length < 2) return NextResponse.json({ customers: [] });

  try {
    const results = await stripe.customers.search({
      query: `name~"${q}" OR email~"${q}"`,
      limit: 10,
    });

    const customers = results.data.map(c => ({
      id: c.id,
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
    }));

    return NextResponse.json({ customers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
