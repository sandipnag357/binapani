# BINAPANI — Contemporary Heritage Apparel eCommerce

Full-stack Next.js App Router eCommerce platform for the **BINAPANI** luxury apparel house, featuring a curated storefront, brand story, product catalog (`Women`, `Men`, `New Arrivals`), cart, Stripe-compatible payment gateway, live order tracking, user accounts, admin dashboard, and SEO optimization.

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Database:** Built-in Node `node:sqlite` (`DatabaseSync`)
- **Authentication:** `scrypt` password hashing + HMAC-SHA256 HTTP-only session cookies
- **Payments:** Stripe `PaymentIntent` API (`/api/payments/stripe`) with integrated sandbox gateway, UPI Instant, and Pay on Delivery

## Getting Started

```bash
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials
- **Customer:** `clara@example.com` / `binapani123`
- **Admin:** `admin@binapani.com` / `admin123`
- **Sample Order Tracking Numbers:** `BNP-104821`, `BNP-104790`, `BNP-104835`
