"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Heart,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";
import { useCart } from "./CartContext";

interface ProductDetailClientProps {
  product: Product;
  initialReviews: Review[];
}

export function ProductDetailClient({
  product,
  initialReviews,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || "Standard"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes("M") ? "M" : product.sizes[0] || "One Size"
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Review state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      priceCents: product.priceCents,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      priceCents: product.priceCents,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName,
          rating,
          title,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setReviews((prev) => [data.review, ...prev]);
      setAuthorName("");
      setTitle("");
      setComment("");
      setRating(5);
      setReviewMessage("Thank you — your review has been published.");
    } catch (err) {
      setReviewMessage(
        err instanceof Error ? err.message : "Could not submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-[#6F6A63]">
        <Link href="/" className="hover:text-[#141414]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/collections/${product.category}`}
          className="capitalize hover:text-[#141414]"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-[#141414]">{product.name}</span>
      </nav>

      {/* Main Split */}
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Image Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE4DC]">
            <Image
              src={product.images[activeImage] || product.images[0]}
              alt={`${product.name} — view ${activeImage + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 bg-[#141414] px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
                New Arrival
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-[3/4] overflow-hidden border-2 bg-[#EAE4DC] transition-all ${
                    activeImage === i
                      ? "border-[#141414]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <div className="flex items-center justify-between text-xs tracking-[0.16em] text-[#6F6A63] uppercase">
              <span>SKU: {product.sku}</span>
              <span
                className={
                  product.stock > 5 ? "text-emerald-700" : "text-[#9A5B3A]"
                }
              >
                {product.stock > 0
                  ? `${product.stock} in atelier stock`
                  : "Out of stock"}
              </span>
            </div>

            <h1 className="font-editorial mt-2 text-4xl font-medium text-[#141414]">
              {product.name}
            </h1>
            <p className="mt-1.5 text-sm text-[#57524C]">{product.subtitle}</p>

            {/* Rating + Price */}
            <div className="mt-5 flex items-center justify-between border-b border-[#E6DFD5] pb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-[#141414]">
                  {formatPrice(product.priceCents)}
                </span>
                {product.compareAtPriceCents && (
                  <span className="text-sm text-[#9B958E] line-through">
                    {formatPrice(product.compareAtPriceCents)}
                  </span>
                )}
              </div>

              <a
                href="#reviews"
                className="flex items-center gap-1.5 text-xs text-[#57524C] hover:text-[#141414]"
              >
                <Star className="h-4 w-4 fill-[#9A5B3A] text-[#9A5B3A]" />
                <span className="font-semibold text-[#141414]">
                  {product.rating.toFixed(1)}
                </span>
                <span>({reviews.length} reviews)</span>
              </a>
            </div>

            {/* Color Selector */}
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase">
                Color: <span className="font-normal text-[#6F6A63]">{selectedColor}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    aria-label={c.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform ${
                      selectedColor === c.name
                        ? "scale-110 border-[#141414]"
                        : "border-[#D4CCC2]"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#141414] uppercase">
                  Size: <span className="font-normal text-[#6F6A63]">{selectedSize}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#9A5B3A] underline underline-offset-4 hover:text-[#141414]"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  Size Guide
                </button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`border py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                      selectedSize === sz
                        ? "border-[#141414] bg-[#141414] text-white"
                        : "border-[#D4CCC2] bg-white text-[#141414] hover:border-[#141414]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & CTAs */}
            <div className="mt-7 space-y-3">
              <div className="flex gap-3">
                <div className="flex items-center border border-[#D4CCC2] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-sm hover:bg-[#FAF8F5]"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 10, q + 1))
                    }
                    className="px-3.5 py-3 text-sm hover:bg-[#FAF8F5]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 bg-[#141414] px-6 py-3.5 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#9A5B3A] disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {product.stock === 0 ? "Sold Out" : "Add to Bag"}
                </button>

                <button
                  type="button"
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label="Save to wishlist"
                  className="border border-[#D4CCC2] bg-white px-3.5 text-[#141414] hover:border-[#141414]"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      wishlisted ? "fill-[#9A5B3A] text-[#9A5B3A]" : ""
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className="w-full border border-[#141414] bg-white py-3.5 text-xs font-semibold tracking-[0.18em] text-[#141414] uppercase transition-colors hover:bg-[#EAE4DC] disabled:opacity-50"
              >
                Buy Now · Express Checkout
              </button>
            </div>

            {/* Details & Care */}
            <div className="mt-8 space-y-5 border-t border-[#E6DFD5] pt-6 text-sm leading-relaxed text-[#57524C]">
              <div>
                <h2 className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
                  Atelier Notes
                </h2>
                <p className="mt-2">{product.description}</p>
              </div>

              <div>
                <h2 className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
                  Fabric &amp; Care
                </h2>
                <p className="mt-2">{product.fabricCare}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#E6DFD5] pt-4 text-xs">
                <div className="flex items-center gap-2 text-[#141414]">
                  <Truck className="h-4 w-4 text-[#9A5B3A]" />
                  <span>Ships within 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-[#141414]">
                  <ShieldCheck className="h-4 w-4 text-[#9A5B3A]" />
                  <span>30-day complimentary returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="mt-20 border-t border-[#E6DFD5] pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#9A5B3A] uppercase">
              Client Reviews
            </p>
            <h2 className="font-editorial mt-2 text-3xl font-medium text-[#141414]">
              Verified Impressions
            </h2>
            <p className="mt-2 text-sm text-[#6F6A63]">
              Have you worn this piece? Share your impressions on drape, sizing,
              and textile quality.
            </p>

            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 space-y-4 border border-[#E6DFD5] bg-white p-6"
            >
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
                Write a Review
              </h3>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                className="w-full border border-[#D4CCC2] px-3 py-2 text-sm focus:border-[#141414] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6F6A63]">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= rating
                          ? "fill-[#9A5B3A] text-[#9A5B3A]"
                          : "text-[#D4CCC2]"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Headline (e.g. Tailored perfection)"
                className="w-full border border-[#D4CCC2] px-3 py-2 text-sm focus:border-[#141414] focus:outline-none"
              />
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share fit, fabric feel, and occasion notes..."
                className="w-full border border-[#D4CCC2] px-3 py-2 text-sm focus:border-[#141414] focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-[#141414] py-2.5 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A] disabled:opacity-50"
              >
                {submittingReview ? "Publishing..." : "Publish Review"}
              </button>
              {reviewMessage && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  {reviewMessage}
                </p>
              )}
            </form>
          </div>

          <div className="space-y-4 lg:col-span-7">
            {reviews.length === 0 ? (
              <p className="border border-[#E6DFD5] bg-white p-8 text-sm text-[#6F6A63]">
                No reviews yet for this piece. Be the first to share your
                impression.
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border border-[#E6DFD5] bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#9A5B3A]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-[#6F6A63]">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-editorial mt-2 text-xl font-medium text-[#141414]">
                    {rev.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#57524C]">
                    {rev.comment}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#141414]">
                    {rev.authorName}{" "}
                    {rev.verifiedPurchase && (
                      <span className="font-normal text-[#9A5B3A]">
                        · Verified Purchase
                      </span>
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4">
              <h3 className="font-editorial text-2xl font-medium">
                Atelier Size Guide (Inches)
              </h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="p-1 text-[#6F6A63] hover:text-[#141414]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <table className="mt-4 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DFD5] text-[#6F6A63] uppercase">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Waist</th>
                  <th className="py-2">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                <tr><td className="py-2 font-semibold">XS</td><td>33–34</td><td>26–27</td><td>35–36</td></tr>
                <tr><td className="py-2 font-semibold">S</td><td>35–36</td><td>28–29</td><td>37–38</td></tr>
                <tr><td className="py-2 font-semibold">M</td><td>37–39</td><td>30–32</td><td>39–41</td></tr>
                <tr><td className="py-2 font-semibold">L</td><td>40–42</td><td>33–35</td><td>42–44</td></tr>
                <tr><td className="py-2 font-semibold">XL</td><td>43–45</td><td>36–38</td><td>45–47</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
