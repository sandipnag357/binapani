"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { PROMO_CODES, formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();
  const { user, refresh } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("India");

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "express"
  );
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">(
    "card"
  );

  // Payment Gateway Fields
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("11/29");
  const [cardCvc, setCardCvc] = useState("842");
  const [upiId, setUpiId] = useState("client@okaxis");

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoFeedback, setPromoFeedback] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setCustomerName((v) => v || user.name);
      setCustomerEmail((v) => v || user.email);
      setCustomerPhone((v) => v || user.phone);
      setShippingAddress((v) => v || user.address);
      setShippingCity((v) => v || user.city);
      setShippingPostalCode((v) => v || user.postalCode);
      setShippingCountry((v) => v || user.country || "India");
    }
  }, [user]);

  const promo = appliedPromo ? PROMO_CODES[appliedPromo] : undefined;
  const discountCents = promo
    ? Math.round((subtotalCents * promo.discountPercent) / 100)
    : 0;
  const shippingCents =
    shippingMethod === "express"
      ? subtotalCents >= 30000
        ? 0
        : 2500
      : subtotalCents >= 20000
      ? 0
      : 1200;
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxableCents * 0.08);
  const totalCents = taxableCents + shippingCents + taxCents;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoFeedback(`Applied: ${PROMO_CODES[code].label}`);
    } else {
      setPromoFeedback("Invalid code. Try BINAPANI10 or ATELIER20.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setError("");
    try {
      // 1. Authorize via Stripe / Payment Gateway endpoint
      const payRes = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: totalCents,
          paymentMethod,
          customerEmail,
          cardNumber,
          cardExpiry,
          cardCvc,
          upiId,
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "Payment authorization declined");
      }

      // 2. Persist verified order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingCountry,
          shippingMethod,
          paymentMethod,
          paymentIntentId: payData.paymentIntentId,
          promoCode: appliedPromo,
          items,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Could not create order");
      }

      clearCart();
      await refresh();
      router.push(
        `/track-order?orderNumber=${encodeURIComponent(
          orderData.order.orderNumber
        )}&placed=1`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl font-medium">
          Your shopping bag is empty
        </h1>
        <p className="mt-3 text-sm text-[#6F6A63]">
          Select a piece from our ready-to-wear collection before proceeding to
          checkout.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-block bg-[#141414] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD5] pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
            Encrypted Atelier Checkout
          </p>
          <h1 className="font-editorial mt-1 text-4xl font-medium text-[#141414]">
            Shipping &amp; Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6F6A63]">
          <Lock className="h-4 w-4 text-[#9A5B3A]" />
          <span>256-Bit SSL · Stripe-Compatible Payment Gateway</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid gap-10 lg:grid-cols-12">
        {/* Left: Form */}
        <div className="space-y-8 lg:col-span-7">
          {/* Contact & Shipping */}
          <section className="border border-[#E6DFD5] bg-white p-6 sm:p-8">
            <h2 className="font-editorial text-2xl font-medium text-[#141414]">
              1. Client &amp; Delivery Address
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Clara Sen"
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
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="clara@example.com"
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98300 55219"
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="42 Park Street, Alipore"
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="Kolkata"
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  placeholder="700027"
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  className="mt-1.5 w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Delivery Method */}
          <section className="border border-[#E6DFD5] bg-white p-6 sm:p-8">
            <h2 className="font-editorial text-2xl font-medium text-[#141414]">
              2. Delivery Tier
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShippingMethod("express")}
                className={`flex items-start justify-between border p-4 text-left transition-colors ${
                  shippingMethod === "express"
                    ? "border-[#141414] bg-[#FAF8F5]"
                    : "border-[#E6DFD5]"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase">
                    Express Atelier Air
                  </p>
                  <p className="mt-1 text-xs text-[#6F6A63]">
                    1–3 business days · Priority insured
                  </p>
                </div>
                <span className="text-xs font-semibold">
                  {subtotalCents >= 30000 ? "Free" : "$25"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod("standard")}
                className={`flex items-start justify-between border p-4 text-left transition-colors ${
                  shippingMethod === "standard"
                    ? "border-[#141414] bg-[#FAF8F5]"
                    : "border-[#E6DFD5]"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase">
                    Standard Ground
                  </p>
                  <p className="mt-1 text-xs text-[#6F6A63]">
                    4–6 business days · Carbon neutral
                  </p>
                </div>
                <span className="text-xs font-semibold">
                  {subtotalCents >= 20000 ? "Free" : "$12"}
                </span>
              </button>
            </div>
          </section>

          {/* Payment Gateway Integration */}
          <section className="border border-[#E6DFD5] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl font-medium text-[#141414]">
                3. Payment Gateway
              </h2>
              <span className="inline-flex items-center gap-1 rounded bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-medium text-[#9A5B3A]">
                <ShieldCheck className="h-3.5 w-3.5" /> Stripe Test Ready
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center justify-center gap-2 border py-3 text-xs font-semibold tracking-wider uppercase ${
                  paymentMethod === "card"
                    ? "border-[#141414] bg-[#141414] text-white"
                    : "border-[#D4CCC2] bg-white text-[#141414]"
                }`}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex items-center justify-center gap-2 border py-3 text-xs font-semibold tracking-wider uppercase ${
                  paymentMethod === "upi"
                    ? "border-[#141414] bg-[#141414] text-white"
                    : "border-[#D4CCC2] bg-white text-[#141414]"
                }`}
              >
                <Smartphone className="h-4 w-4" /> UPI Instant
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center justify-center gap-2 border py-3 text-xs font-semibold tracking-wider uppercase ${
                  paymentMethod === "cod"
                    ? "border-[#141414] bg-[#141414] text-white"
                    : "border-[#D4CCC2] bg-white text-[#141414]"
                }`}
              >
                <Truck className="h-4 w-4" /> Pay on Delivery
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="mt-5 space-y-4 border border-[#EAE4DC] bg-[#FAF8F5] p-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="mt-1.5 w-full border border-[#D4CCC2] bg-white px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="mt-1.5 w-full border border-[#D4CCC2] bg-white px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                      Security Code (CVC)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="mt-1.5 w-full border border-[#D4CCC2] bg-white px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6F6A63]">
                  Pre-filled with Stripe test card <code>4242 4242 4242 4242</code> for instant sandbox authorization.
                </p>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="mt-5 border border-[#EAE4DC] bg-[#FAF8F5] p-5">
                <label className="block text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
                  UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okaxis"
                  className="mt-1.5 w-full border border-[#D4CCC2] bg-white px-3.5 py-2.5 text-sm focus:border-[#141414] focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-[#6F6A63]">
                  Supports Google Pay, PhonePe, Paytm, and BHIM instant settlement.
                </p>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="mt-5 border border-[#EAE4DC] bg-[#FAF8F5] p-5 text-xs leading-relaxed text-[#57524C]">
                Pay via card or cash directly to our white-glove courier upon
                garment inspection at your doorstep.
              </div>
            )}
          </section>
        </div>

        {/* Right: Order Review */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 border border-[#E6DFD5] bg-white p-6 sm:p-8">
            <h2 className="font-editorial text-2xl font-medium text-[#141414]">
              Order Review
            </h2>

            <ul className="mt-5 divide-y divide-[#F0EAE1]">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex items-center gap-4 py-3.5"
                >
                  <div className="relative h-18 w-14 shrink-0 overflow-hidden bg-[#EAE4DC]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#141414]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#6F6A63]">
                      {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Promo Code */}
            <div className="mt-5 border-t border-[#E6DFD5] pt-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (e.g. BINAPANI10)"
                  className="flex-1 border border-[#D4CCC2] px-3 py-2 text-xs uppercase focus:border-[#141414] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="border border-[#141414] px-4 py-2 text-xs font-semibold tracking-wider uppercase hover:bg-[#141414] hover:text-white"
                >
                  Apply
                </button>
              </div>
              {promoFeedback && (
                <p className="mt-2 flex items-center gap-1 text-xs text-[#9A5B3A]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {promoFeedback}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2.5 border-t border-[#E6DFD5] pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6F6A63]">Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between text-[#9A5B3A]">
                  <span>Privilege ({appliedPromo})</span>
                  <span>−{formatPrice(discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6F6A63]">Shipping</span>
                <span>
                  {shippingCents === 0
                    ? "Complimentary"
                    : formatPrice(shippingCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6A63]">Duties &amp; Tax (8%)</span>
                <span>{formatPrice(taxCents)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E6DFD5] pt-3 text-lg font-semibold text-[#141414]">
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-[#141414] py-4 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#9A5B3A] disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {submitting
                ? "Authorizing Payment..."
                : `Authorize & Pay ${formatPrice(totalCents)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
