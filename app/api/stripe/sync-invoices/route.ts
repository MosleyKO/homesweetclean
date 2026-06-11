import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { clientId, stripeCustomerId } = await req.json();
  if (!clientId || !stripeCustomerId) {
    return NextResponse.json({ error: "Missing clientId or stripeCustomerId" }, { status: 400 });
  }

  try {
    const stripeInvoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 100,
    });

    const rows = stripeInvoices.data.map(inv => ({
      client_id: clientId,
      stripe_invoice_id: inv.id,
      stripe_customer_id: stripeCustomerId,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      description: inv.description ?? (inv.lines?.data?.[0]?.description ?? null),
      invoice_url: inv.hosted_invoice_url ?? null,
      invoice_pdf: inv.invoice_pdf ?? null,
      due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      paid_at: inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
        : null,
      invoice_created_at: new Date(inv.created * 1000).toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("invoices")
      .upsert(rows, { onConflict: "stripe_invoice_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
