"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotalCents } = useCart();

  const estimatedShipping = subtotalCents >= 20000 || subtotalCents === 0 ? 0 : 1200;
  const estimatedTax = Math.round(subtotalCents * 0.08);
  const total = subtotalCents + estimatedShipping + estimatedTax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
        BINAPANI Atelier
      </p>
      <h1 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
        Shopping Bag
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 border border-[#E6DFD5] bg-white py-20 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#C8BFB4]" strokeWidth={1.2} />
          <p className="font-editorial mt-4 text-3xl text-[#141414]">
            Your shopping bag is currently empty
          </p>
          <p className="mt-2 text-sm text-[#6F6A63]">
            Discover newly arrived raw silk outerwear, linen tailoring, and knitwear.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 bg-[#141414] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="divide-y divide-[#E6DFD5] border-y border-[#E6DFD5] bg-white px-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden bg-[#EAE4DC]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-editorial text-2xl font-medium text-[#141414] hover:text-[#9A5B3A]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#6F6A63]">
                        Color: {item.color} · Size: {item.size}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#141414]">
                        {formatPrice(item.priceCents)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="inline-flex items-center border border-[#D4CCC2]">
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
                          className="p-2 text-[#6F6A63] hover:text-[#141414]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
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
                          className="p-2 text-[#6F6A63] hover:text-[#141414]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="w-20 text-right text-sm font-semibold text-[#141414]">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId, item.color, item.size)
                        }
                        className="text-[#9B958E] hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="border border-[#E6DFD5] bg-white p-7">
              <h2 className="font-editorial text-2xl font-medium text-[#141414]">
                Order Summary
              </h2>
              <div className="mt-6 space-y-3 border-b border-[#E6DFD5] pb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6F6A63]">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A63]">Estimated Shipping</span>
                  <span className="font-medium">
                    {estimatedShipping === 0
                      ? "Complimentary"
                      : formatPrice(estimatedShipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A63]">Estimated Tax (8%)</span>
                  <span className="font-medium">{formatPrice(estimatedTax)}</span>
                </div>
              </div>
              <div className="mt-5 flex justify-between text-base font-semibold text-[#141414]">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="mt-2 text-xs text-[#6F6A63]">
                Have a promo code like <code className="font-semibold">BINAPANI10</code>? Apply it at checkout.
              </p>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 bg-[#141414] py-4 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#9A5B3A]"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
