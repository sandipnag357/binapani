import React from "react";
import type { Metadata } from "next";
import { listProducts } from "@/lib/db";
import { CatalogView } from "@/components/CatalogView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Apparel & Ready-to-Wear",
  description:
    "Explore the complete BINAPANI apparel collection for women and men — raw silk coats, linen tailoring, and fine merino knitwear.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const products = listProducts({ sort: "featured" });

  return (
    <CatalogView
      eyebrow="Complete Archive"
      title="All Ready-to-Wear"
      description="Every BINAPANI piece is tailored in small numbered batches using traceable natural fibres—raw Tussar silk, certified European flax, and extra-fine merino wool."
      initialProducts={products}
      initialSearch={sp.search || ""}
    />
  );
}
