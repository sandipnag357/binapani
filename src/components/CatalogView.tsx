"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface CatalogViewProps {
  title: string;
  eyebrow: string;
  description: string;
  initialProducts: Product[];
  initialSearch?: string;
  lockedCategory?: "women" | "men" | "new-arrivals";
}

export function CatalogView({
  title,
  eyebrow,
  description,
  initialProducts,
  initialSearch = "",
  lockedCategory,
}: CatalogViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [sort, setSort] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...initialProducts];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (!lockedCategory && categoryFilter !== "all") {
      if (categoryFilter === "new-arrivals") {
        list = list.filter((p) => p.isNewArrival);
      } else {
        list = list.filter((p) => p.category === categoryFilter);
      }
    }

    if (sizeFilter !== "all") {
      list = list.filter((p) => p.sizes.includes(sizeFilter));
    }

    list = list.filter((p) => p.priceCents <= maxPrice);

    if (sort === "price-asc") list.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price-desc")
      list.sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "rating")
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    else if (sort === "newest")
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else
      list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

    return list;
  }, [initialProducts, search, categoryFilter, sizeFilter, maxPrice, sort, lockedCategory]);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Collection Header */}
      <div className="border-b border-[#E6DFD5] pb-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-editorial mt-2 text-4xl font-medium text-[#141414] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57524C]">
          {description}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 border border-[#D4CCC2] bg-white px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase hover:border-[#141414]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? "Hide Filters" : "Filter"}
          </button>

          {!lockedCategory && (
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "All" },
                { key: "women", label: "Women" },
                { key: "men", label: "Men" },
                { key: "new-arrivals", label: "New Arrivals" },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategoryFilter(c.key)}
                  className={`px-3.5 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-colors ${
                    categoryFilter === c.key
                      ? "bg-[#141414] text-white"
                      : "bg-white text-[#6F6A63] hover:bg-[#EAE4DC]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-1 rounded-full bg-[#EAE4DC] px-3 py-1.5 text-xs text-[#141414]"
            >
              Search: &ldquo;{search}&rdquo; <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6F6A63]">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="border border-[#D4CCC2] bg-white px-3 py-2 text-xs font-medium text-[#141414] focus:border-[#141414] focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="mb-8 grid gap-6 border border-[#E6DFD5] bg-white p-6 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase">
              Search Keywords
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Silk, linen, coat, blazer..."
              className="mt-2 w-full border border-[#D4CCC2] px-3 py-2 text-sm focus:border-[#141414] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase">
              Size
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSizeFilter("all")}
                className={`px-2.5 py-1 text-xs ${
                  sizeFilter === "all"
                    ? "bg-[#141414] text-white"
                    : "bg-[#FAF8F5] text-[#6F6A63]"
                }`}
              >
                All
              </button>
              {sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSizeFilter(sz)}
                  className={`px-2.5 py-1 text-xs ${
                    sizeFilter === sz
                      ? "bg-[#141414] text-white"
                      : "bg-[#FAF8F5] text-[#6F6A63]"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase">
              Max Price: ${Math.round(maxPrice / 100)}
            </label>
            <input
              type="range"
              min={10000}
              max={60000}
              step={2500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[#9A5B3A]"
            />
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-[#E6DFD5] bg-white py-20 text-center">
          <p className="font-editorial text-3xl text-[#141414]">
            No matching garments found
          </p>
          <p className="mt-2 text-sm text-[#6F6A63]">
            Try clearing your filters or searching for linen, silk, or merino.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setSizeFilter("all");
              setMaxPrice(60000);
            }}
            className="mt-6 bg-[#141414] px-6 py-3 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
