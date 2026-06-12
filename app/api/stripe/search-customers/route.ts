import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const deny = requireAdmin(req); if (deny) return deny
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q || q.length < 2) return NextResponse.json({ customers: [] });

  try {
    // Run name and email searches in parallel, then merge + dedupe
    const [byName, byEmail] = await Promise.allSettled([
      stripe.customers.search({ query: `name~"${q}"`, limit: 10 }),
      stripe.customers.search({ query: `email~"${q}"`, limit: 10 }),
    ]);

    const seen = new Set<string>();
    const merged = [];

    for (const result of [byName, byEmail]) {
      if (result.status === 'fulfilled') {
        for (const c of result.value.data) {
          if (!seen.has(c.id)) {
            seen.add(c.id);
            merged.push({ id: c.id, name: c.name ?? "", email: c.email ?? "", phone: c.phone ?? "" });
          }
        }
      }
    }

    return NextResponse.json({ customers: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
