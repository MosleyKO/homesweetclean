import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  const deny = requireAdmin(req); if (deny) return deny
  const { clientId, stripeCustomerId, stripeCustomerName } = await req.json();
  if (!clientId || !stripeCustomerId) {
    return NextResponse.json({ error: "Missing clientId or stripeCustomerId" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .update({ stripe_customer_id: stripeCustomerId, stripe_customer_name: stripeCustomerName ?? null })
    .eq("id", clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
