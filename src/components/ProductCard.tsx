"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes("M") ? "M" : product.sizes[0] || "One Size"
  );
  const [hovered, setHovered] = useState(false);

  const primaryImg = product.images[0] || "/images/prod-women-trench.jpg";
  const secondaryImg = product.images[1] || primaryImg;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: primaryImg,
      priceCents: product.priceCents,
      color: product.colors[0]?.name || "Atelier Standard",
      size: selectedSize,
      quantity: 1,
    });
  };

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE4DC]">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={hovered ? secondaryImg : primaryImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-[#141414] px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
              New Arrival
            </span>
          )}
          {product.compareAtPriceCents && (
            <span className="bg-[#9A5B3A] px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
              Atelier Edit
            </span>
          )}
        </div>

        {/* Quick-Add Bar on Hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`min-w-[28px] px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    selectedSize === sz
                      ? "bg-[#141414] text-white"
                      : "bg-[#FAF8F5] text-[#6F6A63] hover:bg-[#EAE4DC]"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="flex w-full items-center justify-center gap-1.5 bg-[#141414] py-2 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#9A5B3A] disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.stock === 0 ? "Sold Out" : `Quick Add · ${selectedSize}`}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3.5 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium tracking-[0.14em] text-[#6F6A63] uppercase">
            {product.category === "women" ? "Women" : "Men"}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#6F6A63]">
            <Star className="h-3 w-3 fill-[#9A5B3A] text-[#9A5B3A]" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="font-editorial text-xl font-medium text-[#141414] transition-colors group-hover:text-[#9A5B3A]"
        >
          {product.name}
        </Link>

        <p className="line-clamp-1 text-xs text-[#6F6A63]">{product.subtitle}</p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#141414]">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtPriceCents && (
              <span className="text-xs text-[#9B958E] line-through">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-[#D4CCC2]"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
