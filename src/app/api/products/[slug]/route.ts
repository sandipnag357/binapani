import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getReviewsForProduct } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const product = getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const reviews = getReviewsForProduct(product.id);
  return NextResponse.json({ product, reviews });
}
