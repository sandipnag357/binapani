import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const updated = updateProduct(id, {
    name: body.name,
    subtitle: body.subtitle,
    priceCents:
      body.priceCents !== undefined ? Number(body.priceCents) : undefined,
    stock: body.stock !== undefined ? Number(body.stock) : undefined,
    isNewArrival: body.isNewArrival,
    isFeatured: body.isFeatured,
    category: body.category,
  });

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await context.params;
  const ok = deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
