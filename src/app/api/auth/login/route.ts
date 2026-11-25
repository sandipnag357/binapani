import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import {
  getSessionCookieName,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = findUserByEmail(String(email));
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
      },
    });

    res.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }
}
