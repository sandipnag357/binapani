"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";

const STAGES: OrderStatus[] = [
  "Placed",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialNum = searchParams.get("orderNumber") || "";
  const placed = searchParams.get("placed") === "1";

  const [orderNumber, setOrderNumber] = useState(initialNum);
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = useCallback(async (num: string, mail?: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ orderNumber: num.trim() });
      if (mail && mail.trim()) qs.set("email", mail.trim());
      const res = await fetch(`/api/orders/track?${qs.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialNum) {
      lookup(initialNum);
    }
  }, [initialNum, lookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(orderNumber, email);
  };

  const currentStageIndex = order
    ? Math.max(0, STAGES.indexOf(order.status))
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      {placed && order && (
        <div className="mb-8 flex items-start gap-4 border border-emerald-200 bg-emerald-50 p-6">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
          <div>
            <p className="font-editorial text-2xl font-medium text-emerald-950">
              Thank you — Your BINAPANI Order is Confirmed
            </p>
            <p className="mt-1 text-sm text-emerald-900">
              Order <strong>{order.orderNumber}</strong> has been authorized (
              <code>{order.paymentIntentId}</code>). Our atelier is preparing
              your pieces for dispatch.
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
          Live Atelier Logistics
        </p>
        <h1 className="font-editorial mt-2 text-4xl font-medium text-[#141414] sm:text-5xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-[#6F6A63]">
          Enter your BINAPANI order number (try sample orders{" "}
          <button
            type="button"
            onClick={() => {
              setOrderNumber("BNP-104821");
              lookup("BNP-104821");
            }}
            className="font-semibold text-[#9A5B3A] underline"
          >
            BNP-104821
          </button>{" "}
          or{" "}
          <button
            type="button"
            onClick={() => {
              setOrderNumber("BNP-104790");
              lookup("BNP-104790");
            }}
            className="font-semibold text-[#9A5B3A] underline"
          >
            BNP-104790
          </button>
          ).
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-3 border border-[#E6DFD5] bg-white p-5 sm:grid-cols-12"
      >
        <input
          type="text"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order Number (e.g. BNP-104821)"
          className="border border-[#D4CCC2] px-4 py-3 text-sm uppercase focus:border-[#141414] focus:outline-none sm:col-span-5"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="border border-[#D4CCC2] px-4 py-3 text-sm focus:border-[#141414] focus:outline-none sm:col-span-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#141414] px-6 py-3 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A] sm:col-span-3"
        >
          <Search className="h-4 w-4" />
          {loading ? "Locating..." : "Track"}
        </button>
      </form>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Tracking Card */}
      {order && (
        <div className="mt-8 space-y-8 border border-[#E6DFD5] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD5] pb-5">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                Order {order.orderNumber}
              </p>
              <h2 className="font-editorial mt-1 text-3xl font-medium text-[#141414]">
                Status: {order.status}
              </h2>
              <p className="mt-1 text-xs text-[#6F6A63]">
                Placed {formatDate(order.createdAt)} · Carrier:{" "}
                <span className="font-medium text-[#141414]">
                  {order.carrier}
                </span>{" "}
                ({order.trackingCode})
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#9A5B3A]">
                Payment: {order.paymentStatus}
              </span>
              <p className="mt-2 text-lg font-semibold text-[#141414]">
                {formatPrice(order.totalCents)}
              </p>
            </div>
          </div>

          {/* 5-Stage Progress Bar */}
          {order.status === "Cancelled" ? (
            <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              This order was cancelled. Any captured payment has been queued for
              refund.
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map((stage, idx) => {
                  const active = idx <= currentStageIndex;
                  return (
                    <div key={stage} className="flex flex-col items-center text-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                          active
                            ? "border-[#9A5B3A] bg-[#9A5B3A] text-white"
                            : "border-[#D4CCC2] bg-white text-[#9B958E]"
                        }`}
                      >
                        {idx === 0 && <Sparkles className="h-4 w-4" />}
                        {idx === 1 && <Package className="h-4 w-4" />}
                        {idx === 2 && <Truck className="h-4 w-4" />}
                        {idx === 3 && <Truck className="h-4 w-4" />}
                        {idx === 4 && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-medium ${
                          active ? "text-[#141414]" : "text-[#9B958E]"
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items & Address */}
          <div className="grid gap-8 border-t border-[#E6DFD5] pt-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
                Garments in Shipment
              </h3>
              <ul className="mt-4 space-y-3">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#EAE4DC]">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="font-semibold text-[#141414] hover:text-[#9A5B3A]"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-[#6F6A63]">
                        {item.color} · Size {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs leading-relaxed text-[#57524C]">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
                Delivery Destination
              </h3>
              <p className="mt-3 font-semibold text-[#141414]">
                {order.customerName}
              </p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingPostalCode}
              </p>
              <p>{order.shippingCountry}</p>
              <p className="mt-2">{order.customerPhone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-[#6F6A63]">
          Loading order tracking...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
