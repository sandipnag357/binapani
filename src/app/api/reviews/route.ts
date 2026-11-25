import { NextRequest, NextResponse } from "next/server";
import { addReview, getProductById, getRecentReviews } from "@/lib/db";

export async function GET() {
  const reviews = getRecentReviews(8);
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId || "");
    const authorName = String(body.authorName || "").trim();
    const title = String(body.title || "").trim();
    const comment = String(body.comment || "").trim();
    const rating = Number(body.rating || 5);

    if (!productId || !getProductById(productId)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!authorName || !title || !comment) {
      return NextResponse.json(
        { error: "Name, headline, and review comment are required" },
        { status: 400 }
      );
    }

    const review = addReview({ productId, authorName, rating, title, comment });
    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 400 });
  }
}
