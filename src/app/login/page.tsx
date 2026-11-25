"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      await refresh();
      router.push(data.user.role === "admin" ? "/admin" : "/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin(email, password);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="border border-[#E6DFD5] bg-white p-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
          Client Portal
        </p>
        <h1 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
          Sign In
        </h1>
        <p className="mt-1.5 text-sm text-[#6F6A63]">
          Access your orders, saved addresses, and private client privileges.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clara@example.com"
              className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              Password
            </label>
            <input
              type="password"
              required
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* One-Click Demo Accounts */}
        <div className="mt-7 border-t border-[#E6DFD5] pt-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#6F6A63] uppercase">
            Instant Demo Access
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => submitLogin("clara@example.com", "binapani123")}
              className="flex items-center justify-center gap-1.5 border border-[#D4CCC2] bg-[#FAF8F5] px-3 py-2.5 text-xs font-medium text-[#141414] hover:border-[#141414]"
            >
              <UserIcon className="h-3.5 w-3.5 text-[#9A5B3A]" />
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => submitLogin("admin@binapani.com", "admin123")}
              className="flex items-center justify-center gap-1.5 border border-[#D4CCC2] bg-[#FAF8F5] px-3 py-2.5 text-xs font-medium text-[#141414] hover:border-[#141414]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#9A5B3A]" />
              Demo Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#6F6A63]">
          New to BINAPANI?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#141414] underline underline-offset-4 hover:text-[#9A5B3A]"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
