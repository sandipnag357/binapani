import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserById, listOrdersForUser, updateUserProfile } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null, orders: [] });
  }
  const user = getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null, orders: [] });
  }
  const orders = listOrdersForUser(user.id, user.email);
  return NextResponse.json({ user, orders });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = updateUserProfile(session.userId, {
      name: body.name ? String(body.name) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      city: body.city !== undefined ? String(body.city) : undefined,
      postalCode: body.postalCode !== undefined ? String(body.postalCode) : undefined,
      country: body.country !== undefined ? String(body.country) : undefined,
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
