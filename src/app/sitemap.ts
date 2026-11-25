import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = listProducts();

  const staticRoutes = [
    "",
    "/shop",
    "/collections/women",
    "/collections/men",
    "/collections/new-arrivals",
    "/story",
    "/track-order",
    "/cart",
    "/checkout",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
