"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotalCents,
  } = useCart();

  if (!isOpen) return null;

  const freeShippingThreshold = 30000; // $300
  const remaining = Math.max(0, freeShippingThreshold - subtotalCents);
  const progress = Math.min(100, (subtotalCents / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF8F5] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD5] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#141414]" strokeWidth={1.6} />
            <h2 className="font-editorial text-2xl font-medium tracking-wide">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-1.5 text-[#6F6A63] hover:bg-[#EAE4DC] hover:text-[#141414]"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="border-b border-[#E6DFD5] bg-white px-6 py-3">
          <p className="text-xs text-[#6F6A63]">
            {remaining === 0 ? (
              <span className="font-medium text-[#141414]">
                You&apos;ve unlocked complimentary Express Atelier Shipping.
              </span>
            ) : (
              <>
                Add{" "}
                <span className="font-semibold text-[#9A5B3A]">
                  {formatPrice(remaining)}
                </span>{" "}
                more for complimentary Express Shipping
              </>
            )}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE4DC]">
            <div
              className="h-full bg-[#9A5B3A] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag
                className="mb-4 h-12 w-12 text-[#C8BFB4]"
                strokeWidth={1.2}
              />
              <p className="font-editorial text-2xl text-[#141414]">
                Your bag is empty
              </p>
              <p className="mt-1 max-w-xs text-sm text-[#6F6A63]">
                Explore our new arrivals in raw silk, Belgian linen, and fine
                merino wool.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 bg-[#141414] px-6 py-3 text-xs font-medium tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E6DFD5]">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex gap-4 py-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-28 w-22 shrink-0 overflow-hidden bg-[#EAE4DC]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-[#141414] hover:text-[#9A5B3A]"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.color, item.size)
                          }
                          className="text-[#9B958E] hover:text-[#B43C2E]"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-[#6F6A63]">
                        {item.color} · Size {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-[#D4CCC2] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.color,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 text-[#6F6A63] hover:text-[#141414]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.color,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 text-[#6F6A63] hover:text-[#141414]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-[#141414]">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E6DFD5] bg-white px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6F6A63]">Subtotal</span>
              <span className="text-base font-semibold text-[#141414]">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#6F6A63]">
              Taxes, promo codes & shipping calculated at checkout.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center border border-[#141414] px-4 py-3 text-xs font-medium tracking-[0.14em] text-[#141414] uppercase hover:bg-[#FAF8F5]"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center gap-1.5 bg-[#141414] px-4 py-3 text-xs font-medium tracking-[0.14em] text-white uppercase hover:bg-[#9A5B3A]"
              >
                Checkout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
