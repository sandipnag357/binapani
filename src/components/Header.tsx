"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

export function Header() {
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setSearchOpen(false);
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/shop");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6DFD5] bg-[#FAF8F5]/95 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-[#141414] px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] text-[#FAF8F5] uppercase">
        Complimentary Express Delivery on Orders Over $300 · Use Code{" "}
        <span className="text-[#E2B496]">BINAPANI10</span> for 10% Off
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu & Primary Nav */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-[#141414] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-7 text-xs font-medium tracking-[0.16em] uppercase lg:flex">
            <Link
              href="/collections/new-arrivals"
              className="text-[#9A5B3A] transition-colors hover:text-[#141414]"
            >
              New Arrivals
            </Link>
            <Link
              href="/collections/women"
              className="text-[#141414] transition-colors hover:text-[#9A5B3A]"
            >
              Women
            </Link>
            <Link
              href="/collections/men"
              className="text-[#141414] transition-colors hover:text-[#9A5B3A]"
            >
              Men
            </Link>
            <Link
              href="/story"
              className="text-[#6F6A63] transition-colors hover:text-[#141414]"
            >
              Brand Story
            </Link>
          </nav>
        </div>

        {/* Center Brand Wordmark */}
        <Link
          href="/"
          className="font-editorial text-2xl font-semibold tracking-[0.28em] text-[#141414] sm:text-3xl"
        >
          BINAPANI
        </Link>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            href="/track-order"
            className="hidden text-xs font-medium tracking-[0.14em] text-[#6F6A63] uppercase transition-colors hover:text-[#141414] md:inline-block"
          >
            Track Order
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden items-center gap-1 rounded-full bg-[#141414] px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-[#FAF8F5] uppercase transition-colors hover:bg-[#9A5B3A] sm:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1 text-[#141414] transition-colors hover:text-[#9A5B3A]"
            aria-label="Search garments"
          >
            <Search className="h-5 w-5" strokeWidth={1.6} />
          </button>

          <Link
            href={user ? "/account" : "/login"}
            className="flex items-center gap-1.5 p-1 text-[#141414] transition-colors hover:text-[#9A5B3A]"
            aria-label={user ? "My account" : "Sign in"}
          >
            <UserIcon className="h-5 w-5" strokeWidth={1.6} />
            {user && (
              <span className="hidden max-w-[90px] truncate text-xs font-medium sm:inline">
                {user.name.split(" ")[0]}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-1.5 p-1 text-[#141414] transition-colors hover:text-[#9A5B3A]"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            {itemCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#9A5B3A] px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#E6DFD5] bg-white px-4 py-3 sm:px-6">
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center gap-3"
          >
            <Search className="h-4 w-4 text-[#6F6A63]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search silk trench, merino overcoat, linen blazer..."
              autoFocus
              className="w-full bg-transparent text-sm text-[#141414] placeholder-[#9B958E] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#141414] px-4 py-1.5 text-xs font-medium tracking-[0.14em] text-white uppercase hover:bg-[#9A5B3A]"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E6DFD5] bg-[#FAF8F5] px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium tracking-[0.14em] uppercase">
            <Link
              href="/collections/new-arrivals"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9A5B3A]"
            >
              New Arrivals
            </Link>
            <Link
              href="/collections/women"
              onClick={() => setMobileMenuOpen(false)}
            >
              Women
            </Link>
            <Link
              href="/collections/men"
              onClick={() => setMobileMenuOpen(false)}
            >
              Men
            </Link>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
              All Apparel
            </Link>
            <Link href="/story" onClick={() => setMobileMenuOpen(false)}>
              Brand Story
            </Link>
            <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}>
              Track Order
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
            >
              {user ? `Account (${user.name.split(" ")[0]})` : "Sign In / Register"}
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9A5B3A]"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
