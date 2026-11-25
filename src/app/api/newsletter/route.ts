import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !String(email).includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    const res = addSubscriber(String(email));
    return NextResponse.json({
      ok: true,
      alreadySubscribed: !res.created,
      promoCode: "BINAPANI10",
    });
  } catch {
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 400 }
    );
  }
}
