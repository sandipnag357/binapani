import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getReviewsForProduct,
  listProducts,
} from "@/lib/db";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Garment Not Found" };

  return {
    title: product.name,
    description: `${product.subtitle} — ${product.description.slice(0, 140)}`,
    openGraph: {
      title: `${product.name} | BINAPANI`,
      description: product.subtitle,
      images: product.images.map((url) => ({ url })),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const reviews = getReviewsForProduct(product.id);
  const related = listProducts({ category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "BINAPANI" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: reviews.length,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} initialReviews={reviews} />

      {related.length > 0 && (
        <section className="border-t border-[#E6DFD5] bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#9A5B3A] uppercase">
              Complete the Silhouette
            </p>
            <h2 className="font-editorial mt-1.5 mb-8 text-3xl font-medium text-[#141414]">
              You May Also Appreciate
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
