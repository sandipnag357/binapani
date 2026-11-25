import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listProducts } from "@/lib/db";
import { CatalogView } from "@/components/CatalogView";

export const dynamic = "force-dynamic";

const COLLECTION_META: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    lockedCategory: "women" | "men" | "new-arrivals";
  }
> = {
  women: {
    eyebrow: "Women's Atelier",
    title: "Women's Ready-to-Wear",
    description:
      "Fluid bias-cut silk dresses, architectural raw silk trench coats, and unconstructed linen tailoring designed for effortless poise.",
    lockedCategory: "women",
  },
  men: {
    eyebrow: "Men's Tailoring",
    title: "Men's Collection",
    description:
      "Double-faced Australian merino overcoats, enzyme-washed Belgian linen overshirts, and relaxed pleated wool-silk trousers.",
    lockedCategory: "men",
  },
  "new-arrivals": {
    eyebrow: "Seasonal Capsule",
    title: "New Arrivals · Autumn / Winter",
    description:
      "Newly released small-batch silhouettes straight from our Mumbai and Kolkata workshops.",
    lockedCategory: "new-arrivals",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = COLLECTION_META[category];
  if (!meta) return { title: "Collection" };
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = COLLECTION_META[category];
  if (!meta) notFound();

  const products = listProducts({ category, sort: "featured" });

  return (
    <CatalogView
      eyebrow={meta.eyebrow}
      title={meta.title}
      description={meta.description}
      initialProducts={products}
      lockedCategory={meta.lockedCategory}
    />
  );
}
