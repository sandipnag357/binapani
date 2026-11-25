import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Instagram,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { getRecentReviews, listProducts } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredProducts = listProducts({ featured: true }).slice(0, 8);
  const newArrivals = listProducts({ newArrival: true }).slice(0, 4);
  const reviews = getRecentReviews(6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BINAPANI",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    description:
      "Contemporary heritage apparel crafted in raw silk, Belgian linen, and extra-fine merino wool.",
    sameAs: ["https://instagram.com", "https://facebook.com"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Editorial Campaign */}
      <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-[#1D1B18]">
        <Image
          src="/images/hero-atelier.jpg"
          alt="BINAPANI Autumn Winter Atelier Collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-[#E2B496] uppercase">
            Autumn / Winter Atelier Edit · 2026
          </p>
          <h1 className="font-editorial mt-3 max-w-3xl text-5xl leading-[1.03] font-medium text-white sm:text-6xl lg:text-7xl">
            Architectural Form, Woven in Living Heritage.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#E7E1D8] sm:text-base">
            Small-batch tailoring sculpted from hand-loomed Tussar silk,
            certified European flax, and double-faced Australian merino wool.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/collections/new-arrivals"
              className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.18em] text-[#141414] uppercase transition-colors hover:bg-[#9A5B3A] hover:text-white"
            >
              Shop New Arrivals
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/collections/women"
              className="border border-white/70 bg-black/25 px-7 py-3.5 text-xs font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-xs transition-colors hover:bg-white hover:text-[#141414]"
            >
              Women
            </Link>
            <Link
              href="/collections/men"
              className="border border-white/70 bg-black/25 px-7 py-3.5 text-xs font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-xs transition-colors hover:bg-white hover:text-[#141414]"
            >
              Men
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions Strip */}
      <section className="border-b border-[#E6DFD5] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 shrink-0 text-[#9A5B3A]" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#141414] uppercase">
                Complimentary Express
              </p>
              <p className="text-xs text-[#6F6A63]">Worldwide shipping $300+</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 shrink-0 text-[#9A5B3A]" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#141414] uppercase">
                100% Natural Fibres
              </p>
              <p className="text-xs text-[#6F6A63]">Raw silk, flax & merino</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 shrink-0 text-[#9A5B3A]" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#141414] uppercase">
                30-Day Tailored Returns
              </p>
              <p className="text-xs text-[#6F6A63]">Complimentary pickup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#9A5B3A]" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#141414] uppercase">
                Stripe & UPI Secured
              </p>
              <p className="text-xs text-[#6F6A63]">Encrypted checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Category Trio */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
              Curated Capsules
            </p>
            <h2 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
              Explore the Collections
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase hover:text-[#9A5B3A]"
          >
            View All Garments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Women's Atelier",
              subtitle: "Silk trench coats, bias-cut dresses & linen suiting",
              href: "/collections/women",
              image: "/images/cat-women.jpg",
            },
            {
              title: "Men's Tailoring",
              subtitle: "Double-faced wool coats & Belgian linen overshirts",
              href: "/collections/men",
              image: "/images/cat-men.jpg",
            },
            {
              title: "New Arrivals",
              subtitle: "Seasonal limited-edition drops from the studio",
              href: "/collections/new-arrivals",
              image: "/images/cat-new-arrivals.jpg",
            },
          ].map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative aspect-[3/4] overflow-hidden bg-[#EAE4DC]"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 text-white">
                <h3 className="font-editorial text-3xl font-medium">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-[#E7E1D8]">{cat.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 border-b border-white/70 pb-0.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors group-hover:border-[#E2B496] group-hover:text-[#E2B496]">
                  Discover <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Highlight */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Just Released
              </p>
              <h2 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/collections/new-arrivals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase hover:text-[#9A5B3A]"
            >
              Shop All New <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Split Banner */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 bg-[#EAE4DC]/65 lg:grid-cols-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden lg:col-span-7 lg:aspect-[16/11]">
            <Image
              src="/images/story-atelier.jpg"
              alt="BINAPANI Atelier Tailoring & Loom Craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-10 sm:px-10 lg:col-span-5 lg:py-12 lg:pr-12 lg:pl-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
              Our Heritage
            </p>
            <h2 className="font-editorial mt-2 text-4xl leading-tight font-medium text-[#141414]">
              Crafted Slowly. Worn for Decades.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#57524C]">
              Founded in Kolkata & Mumbai, BINAPANI honors multi-generational
              handloom weavers and master pattern-makers. Every garment is cut
              from traceable natural fibres—Tussar raw silk, long-staple
              organic cotton, and ZQ merino wool—with zero synthetic linings.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/story"
                className="inline-flex items-center gap-2 bg-[#141414] px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#9A5B3A]"
              >
                Read Our Brand Story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bestsellers */}
      <section className="border-t border-[#E6DFD5] bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
                Signature Silhouettes
              </p>
              <h2 className="font-editorial mt-1.5 text-4xl font-medium text-[#141414]">
                Featured Signatures
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase hover:text-[#9A5B3A]"
            >
              Browse Complete Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Verified Client Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
            Client Impressions
          </p>
          <h2 className="font-editorial mt-2 text-4xl font-medium text-[#141414]">
            Worn Around the World
          </h2>
          <p className="mt-2 text-sm text-[#6F6A63]">
            4.9 / 5.0 average rating across verified atelier purchases
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between border border-[#E6DFD5] bg-white p-7"
            >
              <div>
                <div className="flex items-center gap-1 text-[#9A5B3A]">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <h3 className="font-editorial mt-4 text-2xl font-medium text-[#141414]">
                  &ldquo;{rev.title}&rdquo;
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#57524C]">
                  {rev.comment}
                </p>
              </div>
              <div className="mt-6 border-t border-[#F0EAE1] pt-4 text-xs">
                <p className="font-semibold text-[#141414]">{rev.authorName}</p>
                <p className="text-[#6F6A63]">
                  Verified Buyer · {rev.productName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Media Lookbook Strip (@binapani.atelier) */}
      <section className="border-t border-[#E6DFD5] bg-[#EAE4DC]/45 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#9A5B3A] uppercase">
                <Instagram className="h-4 w-4" /> @binapani.atelier
              </p>
              <h2 className="font-editorial mt-1 text-3xl font-medium text-[#141414]">
                In the Wild · Community Lookbook
              </h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase hover:text-[#9A5B3A]"
            >
              Follow @binapani.atelier →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { img: "/images/prod-women-trench.jpg", slug: "ivory-raw-silk-trench-coat", label: "Aaravya Trench" },
              { img: "/images/prod-men-overcoat.jpg", slug: "charcoal-double-faced-merino-overcoat", label: "Devrat Overcoat" },
              { img: "/images/prod-women-dress.jpg", slug: "terracotta-draped-silk-slip-dress", label: "Nandini Dress" },
              { img: "/images/prod-men-shirt.jpg", slug: "sage-band-collar-belgian-linen-overshirt", label: "Rohan Overshirt" },
              { img: "/images/prod-women-blazer.jpg", slug: "sand-tailored-linen-blazer-set", label: "Meera Blazer" },
              { img: "/images/prod-unisex-scarf.jpg", slug: "handloomed-cashmere-silk-atelier-shawl", label: "Veda Shawl" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/product/${item.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#EAE4DC]"
              >
                <Image
                  src={item.img}
                  alt={item.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[11px] font-medium tracking-wider text-white uppercase">
                    Shop {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
