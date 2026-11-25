"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      await refresh();
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="border border-[#E6DFD5] bg-white p-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
          BINAPANI Membership
        </p>
        <h1 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
          Create Account
        </h1>
        <p className="mt-1.5 text-sm text-[#6F6A63]">
          Enjoy faster checkout, order tracking, and early access to seasonal
          drops.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ananya Roy"
              className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98300 00000"
              className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Password (6+ characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] py-3.5 text-xs font-semibold tracking-[0.18em] text-white uppercase hover:bg-[#9A5B3A] disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6F6A63]">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#141414] underline underline-offset-4 hover:text-[#9A5B3A]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
