import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a password of 6+ characters are required" },
        { status: 400 }
      );
    }

    if (findUserByEmail(String(email))) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = createUser({
      name: String(name),
      email: String(email),
      password: String(password),
      phone: phone ? String(phone) : "",
    });

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 400 }
    );
  }
}
