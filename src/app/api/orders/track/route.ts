import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const email = searchParams.get("email") ?? undefined;

  if (!orderNumber.trim()) {
    return NextResponse.json(
      { error: "Please provide an order number" },
      { status: 400 }
    );
  }

  const order = getOrderByNumber(orderNumber, email || undefined);
  if (!order) {
    return NextResponse.json(
      { error: "No matching order found. Verify your order number (e.g. BNP-104821)." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
