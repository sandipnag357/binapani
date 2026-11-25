import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Leaf, Scissors, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Story & Atelier Heritage",
  description:
    "Discover the story behind BINAPANI — architectural tailoring, hand-loomed Tussar silk, European flax linen, and enduring craftsmanship.",
};

export default function StoryPage() {
  return (
    <div className="bg-[#FAF8F5]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.26em] text-[#9A5B3A] uppercase">
          The House of BINAPANI
        </p>
        <h1 className="font-editorial mt-3 max-w-4xl text-5xl leading-[1.06] font-medium text-[#141414] sm:text-6xl">
          Where Handloom Heritage Meets Quiet Architectural Tailoring.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#57524C]">
          Named after the patron muse of art, rhythm, and craft, BINAPANI was
          born between a family weaving collective in West Bengal and a modern
          pattern-cutting atelier in Mumbai.
        </p>

        <div className="relative mt-10 aspect-[16/8] w-full overflow-hidden bg-[#EAE4DC]">
          <Image
            src="/images/story-atelier.jpg"
            alt="BINAPANI Atelier Workshop"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Three Pillars */}
      <section className="border-y border-[#E6DFD5] bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="space-y-3">
            <Scissors className="h-6 w-6 text-[#9A5B3A]" strokeWidth={1.5} />
            <h2 className="font-editorial text-3xl font-medium text-[#141414]">
              Small-Batch Tailoring
            </h2>
            <p className="text-sm leading-relaxed text-[#57524C]">
              Every silhouette is released in numbered runs of 50 to 150 pieces.
              Our master cutters hand-baste shoulder lines and finish interior
              seams with French binding or breathable cupro.
            </p>
          </div>
          <div className="space-y-3">
            <Leaf className="h-6 w-6 text-[#9A5B3A]" strokeWidth={1.5} />
            <h2 className="font-editorial text-3xl font-medium text-[#141414]">
              Traceable Natural Fibres
            </h2>
            <p className="text-sm leading-relaxed text-[#57524C]">
              We work exclusively with unbleached Tussar silk, GOTS-certified
              organic cotton, Belgian flax linen, and ZQ-traceable Australian
              merino wool—zero polyester blends.
            </p>
          </div>
          <div className="space-y-3">
            <Sparkles className="h-6 w-6 text-[#9A5B3A]" strokeWidth={1.5} />
            <h2 className="font-editorial text-3xl font-medium text-[#141414]">
              Artisanal Dye Houses
            </h2>
            <p className="text-sm leading-relaxed text-[#57524C]">
              Our terracotta, espresso, and sage palettes are achieved using
              low-impact mineral and botanical pigments that age gracefully with
              sunlight and wear.
            </p>
          </div>
        </div>
      </section>

      {/* Narrative Split */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE4DC]">
            <Image
              src="/images/cat-women.jpg"
              alt="BINAPANI Silk & Linen Silhouette"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
              2019 — Present
            </p>
            <h2 className="font-editorial text-4xl leading-tight font-medium text-[#141414]">
              Designed for Movement Across Climates & Continents.
            </h2>
            <p className="text-sm leading-relaxed text-[#57524C]">
              Modern life rarely stays in one city or season. Our garments are
              engineered to layer effortlessly: a double-faced merino overcoat
              over a breathable band-collar linen overshirt, or a raw silk
              trench over a bias-cut slip dress.
            </p>
            <div className="grid grid-cols-3 gap-6 border-t border-[#E6DFD5] pt-6">
              <div>
                <p className="font-editorial text-3xl font-semibold text-[#141414]">
                  42
                </p>
                <p className="mt-1 text-xs text-[#6F6A63]">
                  Partner Weaver Families
                </p>
              </div>
              <div>
                <p className="font-editorial text-3xl font-semibold text-[#141414]">
                  100%
                </p>
                <p className="mt-1 text-xs text-[#6F6A63]">
                  Biodegradable Fibres
                </p>
              </div>
              <div>
                <p className="font-editorial text-3xl font-semibold text-[#141414]">
                  18d
                </p>
                <p className="mt-1 text-xs text-[#6F6A63]">
                  Handloom Shawl Craft
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#141414] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
              >
                Explore the Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
