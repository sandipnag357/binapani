import { NextRequest, NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured") === "true";
  const newArrival = searchParams.get("newArrival") === "true";
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const products = listProducts({
    category,
    featured,
    newArrival,
    search,
    sort,
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const product = createProduct({
      name: String(body.name || "").trim(),
      subtitle: String(body.subtitle || "").trim(),
      description: String(body.description || "").trim(),
      fabricCare: String(
        body.fabricCare || "100% Natural Atelier Blend. Dry clean recommended."
      ).trim(),
      category: body.category === "men" ? "men" : "women",
      isNewArrival: Boolean(body.isNewArrival),
      isFeatured: Boolean(body.isFeatured),
      priceCents: Math.max(100, Math.round(Number(body.priceCents) || 15000)),
      compareAtPriceCents: body.compareAtPriceCents
        ? Math.round(Number(body.compareAtPriceCents))
        : null,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : ["/images/prod-women-trench.jpg"],
      colors:
        Array.isArray(body.colors) && body.colors.length > 0
          ? body.colors
          : [{ name: "Warm Sand", hex: "#D6C7B2" }],
      sizes:
        Array.isArray(body.sizes) && body.sizes.length > 0
          ? body.sizes
          : ["XS", "S", "M", "L", "XL"],
      stock: Math.max(0, Math.round(Number(body.stock) || 20)),
      sku: String(body.sku || `BNP-${Date.now().toString().slice(-5)}`),
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid product payload" },
      { status: 400 }
    );
  }
}
