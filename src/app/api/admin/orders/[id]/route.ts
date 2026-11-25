import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = [
  "Placed",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
  "Cancelled",
];

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
  const status = body.status as OrderStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const updated = updateOrderStatus(
    id,
    status,
    body.trackingCode ? String(body.trackingCode) : undefined
  );
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}
