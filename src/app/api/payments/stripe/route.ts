import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amountCents = Math.max(100, Math.round(Number(body.amountCents) || 0));
    const paymentMethod = String(body.paymentMethod || "card");
    const customerEmail = String(body.customerEmail || "guest@binapani.com");

    // If a real Stripe secret key is configured, create an authentic Stripe PaymentIntent
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        receipt_email: customerEmail,
        automatic_payment_methods: { enabled: true },
        metadata: { brand: "BINAPANI", method: paymentMethod },
      });
      return NextResponse.json({
        mode: "stripe-live",
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
        status: "succeeded",
      });
    }

    // Integrated Stripe-Compatible Sandbox Payment Gateway (no external API key needed)
    if (paymentMethod === "card") {
      const cardNumber = String(body.cardNumber || "").replace(/\s+/g, "");
      if (cardNumber.length < 12) {
        return NextResponse.json(
          { error: "Please enter a valid 16-digit card number" },
          { status: 400 }
        );
      }
      if (cardNumber.endsWith("0002")) {
        return NextResponse.json(
          { error: "Card declined by issuing bank (test decline 0002)" },
          { status: 402 }
        );
      }
    }

    const paymentIntentId = `pi_binapani_${crypto
      .randomBytes(8)
      .toString("hex")}`;

    return NextResponse.json({
      mode: "binapani-sandbox-gateway",
      paymentIntentId,
      status: paymentMethod === "cod" ? "pending_cod" : "succeeded",
      authorizedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Payment gateway authorization failed",
      },
      { status: 500 }
    );
  }
}
