import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createOrder, getProductById, listAllOrders } from "@/lib/db";
import { PROMO_CODES } from "@/lib/format";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return NextResponse.json({ orders: listAllOrders() });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await req.json();

    const itemsInput = Array.isArray(body.items) ? body.items : [];
    if (itemsInput.length === 0) {
      return NextResponse.json(
        { error: "Your shopping bag is empty" },
        { status: 400 }
      );
    }

    const verifiedItems: Array<{
      productId: string;
      productSlug: string;
      productName: string;
      image: string;
      color: string;
      size: string;
      quantity: number;
      unitPriceCents: number;
    }> = [];

    let subtotalCents = 0;
    for (const raw of itemsInput) {
      const prod = getProductById(String(raw.productId));
      if (!prod) {
        return NextResponse.json(
          { error: `Product no longer available: ${raw.productName || raw.productId}` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.min(20, Math.round(Number(raw.quantity) || 1)));
      subtotalCents += prod.priceCents * qty;
      verifiedItems.push({
        productId: prod.id,
        productSlug: prod.slug,
        productName: prod.name,
        image: prod.images[0],
        color: String(raw.color || prod.colors[0]?.name || "Standard"),
        size: String(raw.size || prod.sizes[0] || "M"),
        quantity: qty,
        unitPriceCents: prod.priceCents,
      });
    }

    const promoKey = body.promoCode
      ? String(body.promoCode).trim().toUpperCase()
      : null;
    const promo = promoKey ? PROMO_CODES[promoKey] : undefined;
    const discountCents = promo
      ? Math.round((subtotalCents * promo.discountPercent) / 100)
      : 0;

    const shippingMethod = body.shippingMethod === "express" ? "express" : "standard";
    const shippingCents =
      shippingMethod === "express"
        ? subtotalCents >= 30000
          ? 0
          : 2500
        : subtotalCents >= 20000
        ? 0
        : 1200;

    const taxableCents = Math.max(0, subtotalCents - discountCents);
    const taxCents = Math.round(taxableCents * 0.08);
    const totalCents = taxableCents + shippingCents + taxCents;

    const paymentMethod =
      body.paymentMethod === "upi" || body.paymentMethod === "cod"
        ? body.paymentMethod
        : "card";

    const order = createOrder({
      userId: session?.userId ?? null,
      customerName: String(body.customerName || "").trim(),
      customerEmail: String(body.customerEmail || "").trim(),
      customerPhone: String(body.customerPhone || "").trim(),
      shippingAddress: String(body.shippingAddress || "").trim(),
      shippingCity: String(body.shippingCity || "").trim(),
      shippingPostalCode: String(body.shippingPostalCode || "").trim(),
      shippingCountry: String(body.shippingCountry || "India").trim(),
      shippingMethod,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid",
      paymentIntentId: String(body.paymentIntentId || `pi_binapani_${Date.now()}`),
      promoCode: promo ? promoKey : null,
      subtotalCents,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
      items: verifiedItems,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not place order" },
      { status: 400 }
    );
  }
}
