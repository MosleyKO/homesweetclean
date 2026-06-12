import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type GuestCharge = {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  receipt_url: string | null
  payment_date: string
}

export async function POST(req: NextRequest) {
  const deny = requireAdmin(req); if (deny) return deny
  const { clientId, charges }: { clientId: string; charges: GuestCharge[] } = await req.json();
  if (!clientId || !charges?.length) {
    return NextResponse.json({ error: "Missing clientId or charges" }, { status: 400 });
  }

  const rows = charges.map(c => ({
    client_id: clientId,
    stripe_charge_id: c.id,
    stripe_customer_id: null,
    amount: c.amount,
    currency: c.currency,
    status: c.status,
    description: c.description,
    receipt_url: c.receipt_url,
    payment_date: c.payment_date,
  }));

  const { error } = await supabaseAdmin
    .from("payments")
    .upsert(rows, { onConflict: "stripe_charge_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
