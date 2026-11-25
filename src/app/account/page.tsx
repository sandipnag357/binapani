"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { formatDate, formatPrice } from "@/lib/format";

export default function AccountPage() {
  const router = useRouter();
  const { user, orders, loading, refresh, logout } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAddress(user.address);
      setCity(user.city);
      setPostalCode(user.postalCode);
      setCountry(user.country || "India");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-[#6F6A63]">
        Loading your client profile...
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
          postalCode,
          country,
        }),
      });
      if (res.ok) {
        await refresh();
        setSavedMsg("Profile & shipping address saved.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD5] pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
            Client Account
          </p>
          <h1 className="font-editorial mt-1 text-4xl font-medium text-[#141414]">
            Welcome, {user.name}
          </h1>
          <p className="mt-1 text-xs text-[#6F6A63]">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-[#141414] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-white uppercase hover:bg-[#9A5B3A]"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 border border-[#D4CCC2] bg-white px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase hover:border-[#141414]"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Profile & Address */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 border border-[#E6DFD5] bg-white p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-4">
              <UserIcon className="h-4 w-4 text-[#9A5B3A]" />
              <h2 className="font-editorial text-2xl font-medium">
                Profile &amp; Saved Address
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                <MapPin className="h-3.5 w-3.5" /> Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#141414] py-3 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {savedMsg && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {savedMsg}
              </p>
            )}
          </form>
        </div>

        {/* Order History */}
        <div className="lg:col-span-7">
          <div className="border border-[#E6DFD5] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#9A5B3A]" />
                <h2 className="font-editorial text-2xl font-medium">
                  Order History ({orders.length})
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold tracking-wider text-[#9A5B3A] uppercase hover:underline"
              >
                Shop More →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#6F6A63]">
                You haven&apos;t placed an order yet.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#F0EAE1]">
                {orders.map((ord) => (
                  <div key={ord.id} className="py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#141414]">
                          Order {ord.orderNumber}
                        </p>
                        <p className="text-xs text-[#6F6A63]">
                          {formatDate(ord.createdAt)} · {ord.items?.length || 0}{" "}
                          item(s) · {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#9A5B3A]">
                          {ord.status}
                        </span>
                        <p className="mt-1 text-sm font-semibold">
                          {formatPrice(ord.totalCents)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#6F6A63]">
                        Tracking: {ord.trackingCode}
                      </span>
                      <Link
                        href={`/track-order?orderNumber=${encodeURIComponent(
                          ord.orderNumber
                        )}`}
                        className="font-semibold text-[#141414] underline underline-offset-4 hover:text-[#9A5B3A]"
                      >
                        Track Live Shipment →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
