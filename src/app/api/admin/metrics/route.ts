import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAdminMetrics, listProducts } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const metrics = getAdminMetrics();
  const products = listProducts();
  return NextResponse.json({ metrics, products });
}
