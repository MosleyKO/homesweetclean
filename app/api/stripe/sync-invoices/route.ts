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
    // Pull invoices and all charges in parallel
    const [stripeInvoices, stripeCharges] = await Promise.all([
      stripe.invoices.list({ customer: stripeCustomerId, limit: 100 }),
      stripe.charges.list({ customer: stripeCustomerId, limit: 100 }),
    ]);

    // Upsert invoices
    const invoiceRows = stripeInvoices.data.map(inv => {
      const paidAt = typeof inv.status_transitions?.paid_at === 'number'
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
        : null;
      const firstLineDesc = Array.isArray(inv.lines?.data) && inv.lines.data.length > 0
        ? (inv.lines.data[0].description ?? null)
        : null;
      return {
        client_id: clientId,
        stripe_invoice_id: inv.id,
        stripe_customer_id: stripeCustomerId,
        amount_due: inv.amount_due ?? 0,
        amount_paid: inv.amount_paid ?? 0,
        currency: inv.currency ?? 'usd',
        status: inv.status ?? 'draft',
        description: inv.description ?? firstLineDesc,
        invoice_url: inv.hosted_invoice_url ?? null,
        invoice_pdf: inv.invoice_pdf ?? null,
        due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
        paid_at: paidAt,
        invoice_created_at: new Date(inv.created * 1000).toISOString(),
      };
    });

    if (invoiceRows.length > 0) {
      const { error } = await supabaseAdmin
        .from("invoices")
        .upsert(invoiceRows, { onConflict: "stripe_invoice_id" });
      if (error) {
        console.error("Invoice upsert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Standalone charges — those not tied to an invoice
    const standaloneCharges = stripeCharges.data.filter(c => !(c as any).invoice);
    const paymentRows = standaloneCharges.map(c => ({
      client_id: clientId,
      stripe_charge_id: c.id,
      stripe_customer_id: stripeCustomerId,
      amount: c.amount ?? 0,
      currency: c.currency ?? 'usd',
      status: c.status ?? 'unknown',
      description: c.description ?? null,
      receipt_url: c.receipt_url ?? null,
      payment_date: new Date(c.created * 1000).toISOString(),
    }));

    if (paymentRows.length > 0) {
      const { error } = await supabaseAdmin
        .from("payments")
        .upsert(paymentRows, { onConflict: "stripe_charge_id" });
      if (error) {
        console.error("Payment upsert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      invoices: invoiceRows.length,
      payments: paymentRows.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
