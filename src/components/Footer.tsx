"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("done");
      setMessage(
        data.alreadySubscribed
          ? "You are already on our Private Atelier list. Enjoy code BINAPANI10."
          : "Welcome to the Atelier. Use code BINAPANI10 for 10% off your first order."
      );
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe");
    }
  };

  return (
    <footer className="border-t border-[#E6DFD5] bg-[#141414] text-[#EAE4DC]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="font-editorial text-3xl font-semibold tracking-[0.28em] text-white"
            >
              BINAPANI
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#B6AEA4]">
              Contemporary heritage apparel crafted in small batches from raw
              Tussar silk, European flax linen, and extra-fine merino wool.
              Designed for enduring elegance.
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-white uppercase">
                Join the Private Atelier List
              </p>
              <form
                onSubmit={handleSubscribe}
                className="mt-3 flex max-w-md border border-[#3A3530] bg-[#1E1C1A]"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for 10% off"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-[#7D766F] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 bg-[#9A5B3A] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#B26E4B] disabled:opacity-60"
                >
                  {status === "loading" ? "..." : "Join"}
                </button>
              </form>
              {message && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    status === "error" ? "text-red-400" : "text-[#E2B496]"
                  }`}
                >
                  {status === "done" && <Check className="h-3.5 w-3.5" />}
                  {message}
                </p>
              )}
            </div>

            {/* Social Media Integration */}
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="BINAPANI on Instagram"
                className="rounded-full border border-[#3A3530] p-2.5 text-[#EAE4DC] transition-colors hover:border-[#9A5B3A] hover:text-[#E2B496]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="BINAPANI on Facebook"
                className="rounded-full border border-[#3A3530] p-2.5 text-[#EAE4DC] transition-colors hover:border-[#9A5B3A] hover:text-[#E2B496]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="BINAPANI on X"
                className="rounded-full border border-[#3A3530] p-2.5 text-[#EAE4DC] transition-colors hover:border-[#9A5B3A] hover:text-[#E2B496]"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="BINAPANI on YouTube"
                className="rounded-full border border-[#3A3530] p-2.5 text-[#EAE4DC] transition-colors hover:border-[#9A5B3A] hover:text-[#E2B496]"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Collections
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#B6AEA4]">
                <li>
                  <Link href="/collections/new-arrivals" className="hover:text-white">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/collections/women" className="hover:text-white">
                    Women&apos;s Ready-to-Wear
                  </Link>
                </li>
                <li>
                  <Link href="/collections/men" className="hover:text-white">
                    Men&apos;s Tailoring
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white">
                    All Pieces
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Atelier & Care
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#B6AEA4]">
                <li>
                  <Link href="/story" className="hover:text-white">
                    Brand Story
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="hover:text-white">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-white">
                    Shopping Bag
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-white">
                    Client Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Boutique & Portal
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#B6AEA4]">
                <li>14 Kala Ghoda Heritage Lane</li>
                <li>Mumbai 400001 · India</li>
                <li>concierge@binapani.com</li>
                <li className="pt-2">
                  <Link
                    href="/admin"
                    className="text-xs font-semibold tracking-[0.14em] text-[#E2B496] uppercase hover:underline"
                  >
                    Admin Dashboard →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Payment Trust Strip */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#2D2926] pt-8 text-xs text-[#8C857D] sm:flex-row">
          <p>© {new Date().getFullYear()} BINAPANI Atelier Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-wider uppercase">
            <span className="rounded border border-[#3A3530] px-2.5 py-1 text-[#D8D0C5]">
              Stripe Verified
            </span>
            <span className="rounded border border-[#3A3530] px-2.5 py-1 text-[#D8D0C5]">
              Visa / Mastercard
            </span>
            <span className="rounded border border-[#3A3530] px-2.5 py-1 text-[#D8D0C5]">
              UPI Instant
            </span>
            <span className="rounded border border-[#3A3530] px-2.5 py-1 text-[#D8D0C5]">
              256-Bit SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
