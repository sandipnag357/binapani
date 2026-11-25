import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import { hashPassword } from "./auth";
import type { Order, OrderItem, OrderStatus, Product, Review, User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "binapani.sqlite");

let dbInstance: DatabaseSync | null = null;
let initialized = false;

function getRawDb(): DatabaseSync {
  if (!dbInstance) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec("PRAGMA foreign_keys = ON;");
  }
  if (!initialized) {
    initialized = true;
    initSchema(dbInstance);
    seedIfEmpty(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      postalCode TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT 'India',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      fabricCare TEXT NOT NULL,
      category TEXT NOT NULL,
      isNewArrival INTEGER NOT NULL DEFAULT 0,
      isFeatured INTEGER NOT NULL DEFAULT 0,
      priceCents INTEGER NOT NULL,
      compareAtPriceCents INTEGER,
      imagesJson TEXT NOT NULL,
      colorsJson TEXT NOT NULL,
      sizesJson TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 25,
      sku TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 4.8,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      verifiedPurchase INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      userId TEXT,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      shippingCity TEXT NOT NULL,
      shippingPostalCode TEXT NOT NULL,
      shippingCountry TEXT NOT NULL,
      shippingMethod TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      paymentIntentId TEXT NOT NULL,
      promoCode TEXT,
      subtotalCents INTEGER NOT NULL,
      discountCents INTEGER NOT NULL DEFAULT 0,
      shippingCents INTEGER NOT NULL DEFAULT 0,
      taxCents INTEGER NOT NULL DEFAULT 0,
      totalCents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Placed',
      carrier TEXT NOT NULL DEFAULT 'BlueDart Atelier Express',
      trackingCode TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      productSlug TEXT NOT NULL,
      productName TEXT NOT NULL,
      image TEXT NOT NULL,
      color TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPriceCents INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

function seedIfEmpty(db: DatabaseSync) {
  const countRow = db
    .prepare("SELECT COUNT(*) as cnt FROM products")
    .get() as { cnt: number };
  if (countRow.cnt > 0) return;

  const now = new Date().toISOString();

  // Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, passwordHash, role, phone, address, city, postalCode, country, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = "usr_admin_binapani";
  const claraId = "usr_clara_demo";
  const arjunId = "usr_arjun_demo";

  insertUser.run(
    adminId,
    "Binapani Creative Director",
    "admin@binapani.com",
    hashPassword("admin123"),
    "admin",
    "+91 98201 44100",
    "14 Kala Ghoda Heritage Lane",
    "Mumbai",
    "400001",
    "India",
    now
  );

  insertUser.run(
    claraId,
    "Clara Sen",
    "clara@example.com",
    hashPassword("binapani123"),
    "customer",
    "+91 98300 55219",
    "42 Park Street, Alipore",
    "Kolkata",
    "700027",
    "India",
    now
  );

  insertUser.run(
    arjunId,
    "Arjun Mehta",
    "arjun@example.com",
    hashPassword("binapani123"),
    "customer",
    "+1 415 555 0198",
    "780 Valencia Street, Apt 4B",
    "San Francisco",
    "94110",
    "United States",
    now
  );

  // Seed Products (12 curated pieces across Women, Men, New Arrivals)
  const products: Array<Omit<Product, "createdAt"> & { createdAt: string }> = [
    {
      id: "prod_01",
      slug: "ivory-raw-silk-trench-coat",
      name: "Aaravya Raw Silk Trench Coat",
      subtitle: "Double-breasted architectural silhouette in unbleached Tussar silk & organic linen",
      description:
        "Tailored for effortless movement, the Aaravya Trench balances crisp architectural lapels with the fluid drape of hand-loomed Tussar raw silk blended with Belgian linen. Finished with horn buttons, deep welt pockets, and a removable waist tie.",
      fabricCare:
        "60% Hand-loomed Raw Tussar Silk, 40% European Flax Linen. Bemberg cupro half-lining. Dry clean only; steam lightly on reverse.",
      category: "women",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 34500,
      compareAtPriceCents: 41000,
      images: [
        "/images/prod-women-trench.jpg",
        "/images/cat-women.jpg",
        "/images/hero-atelier.jpg",
      ],
      colors: [
        { name: "Ivory Chalk", hex: "#F3EFE6" },
        { name: "Warm Sand", hex: "#D6C7B2" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 18,
      sku: "BNP-W-TR01",
      rating: 4.9,
      reviewCount: 3,
      createdAt: "2026-11-20T10:00:00.000Z",
    },
    {
      id: "prod_02",
      slug: "terracotta-draped-silk-slip-dress",
      name: "Nandini Bias-Cut Silk Midi Dress",
      subtitle: "Fluid bias-cut silhouette in natural mineral-dyed organic silk-cotton",
      description:
        "Cut on a true 45-degree bias for a body-skimming drape that flatters every stride. Dyed in small batches using terracotta mineral pigments and finished with delicate French seams.",
      fabricCare:
        "70% Organic Mulberry Silk, 30% Long-Staple Cotton. Hand wash cold with pH-neutral detergent or dry clean.",
      category: "women",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 24000,
      compareAtPriceCents: null,
      images: [
        "/images/prod-women-dress.jpg",
        "/images/cat-women.jpg",
      ],
      colors: [
        { name: "Terracotta Clay", hex: "#B55D3D" },
        { name: "Obsidian Ink", hex: "#1B1B1B" },
      ],
      sizes: ["XS", "S", "M", "L"],
      stock: 24,
      sku: "BNP-W-DR02",
      rating: 4.8,
      reviewCount: 2,
      createdAt: "2026-11-19T10:00:00.000Z",
    },
    {
      id: "prod_03",
      slug: "sand-tailored-linen-blazer-set",
      name: "Meera Tailored Atelier Blazer",
      subtitle: "Single-breasted unconstructed linen tailoring with sculptural shoulder",
      description:
        "Designed for boardrooms and gallery openings alike, the Meera Blazer features softly padded shoulders, hand-basted pick stitching, and breathable heavyweight linen suiting that softens beautifully with wear.",
      fabricCare:
        "100% Certified European Flax Linen (310 GSM). Dry clean recommended.",
      category: "women",
      isNewArrival: false,
      isFeatured: true,
      priceCents: 28500,
      compareAtPriceCents: 32000,
      images: [
        "/images/prod-women-blazer.jpg",
        "/images/cat-women.jpg",
      ],
      colors: [
        { name: "Limestone Sand", hex: "#D8CBB8" },
        { name: "Charcoal Slate", hex: "#373737" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 15,
      sku: "BNP-W-BZ03",
      rating: 4.9,
      reviewCount: 2,
      createdAt: "2026-11-12T10:00:00.000Z",
    },
    {
      id: "prod_04",
      slug: "espresso-merino-ribbed-turtleneck",
      name: "Kavya Ribbed Merino Turtleneck",
      subtitle: "Extra-fine 18.5-micron ZQ-certified merino wool knit",
      description:
        "Knitted on fine-gauge Italian frames in a tactile fisherman rib, the Kavya Turtleneck offers featherlight warmth without bulk. Styled effortlessly under blazers or paired with pleated midi skirts.",
      fabricCare:
        "100% Extra-Fine Merino Wool. Hand wash cold, reshape and dry flat.",
      category: "women",
      isNewArrival: false,
      isFeatured: false,
      priceCents: 17500,
      compareAtPriceCents: null,
      images: ["/images/prod-women-knit.jpg"],
      colors: [
        { name: "Deep Espresso", hex: "#3A2820" },
        { name: "Oatmeal Cream", hex: "#EAE2D3" },
      ],
      sizes: ["XS", "S", "M", "L"],
      stock: 30,
      sku: "BNP-W-KN04",
      rating: 4.7,
      reviewCount: 1,
      createdAt: "2026-11-05T10:00:00.000Z",
    },
    {
      id: "prod_05",
      slug: "ivory-organic-poplin-atelier-shirt",
      name: "Suhani Crisp Poplin Shirt",
      subtitle: "Relaxed dropped-shoulder silhouette in GOTS-certified organic cotton",
      description:
        "A wardrobe cornerstone reimagined with mother-of-pearl buttons, deep architectural cuffs, and a curved shirttail hem crafted from high-density crisp organic cotton poplin.",
      fabricCare:
        "100% GOTS-Certified Organic Cotton Poplin. Machine wash cold gentle, hang dry, warm iron.",
      category: "women",
      isNewArrival: true,
      isFeatured: false,
      priceCents: 13500,
      compareAtPriceCents: null,
      images: ["/images/prod-women-shirt.jpg"],
      colors: [
        { name: "Crisp Ivory", hex: "#FAF8F2" },
        { name: "Sky Mist", hex: "#CBD6DF" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 42,
      sku: "BNP-W-SH05",
      rating: 4.8,
      reviewCount: 1,
      createdAt: "2026-11-18T10:00:00.000Z",
    },
    {
      id: "prod_06",
      slug: "charcoal-double-faced-merino-overcoat",
      name: "Devrat Double-Faced Wool Overcoat",
      subtitle: "Hand-finished obsidian merino overcoat with relaxed raglan drape",
      description:
        "Crafted from 720 GSM double-faced Australian merino wool, the Devrat Overcoat is hand-split and blind-stitched at the seams for an ultra-clean interior without heavy lining. Built for decades of winter wear.",
      fabricCare:
        "90% Australian Merino Wool, 10% Mulberry Silk. Specialist dry clean only.",
      category: "men",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 42000,
      compareAtPriceCents: 48500,
      images: [
        "/images/prod-men-overcoat.jpg",
        "/images/cat-men.jpg",
        "/images/hero-atelier.jpg",
      ],
      colors: [
        { name: "Obsidian Charcoal", hex: "#1E1F21" },
        { name: "Camel Ochre", hex: "#A87C4F" },
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 12,
      sku: "BNP-M-OC06",
      rating: 5.0,
      reviewCount: 2,
      createdAt: "2026-11-21T10:00:00.000Z",
    },
    {
      id: "prod_07",
      slug: "sage-band-collar-belgian-linen-overshirt",
      name: "Rohan Band-Collar Linen Overshirt",
      subtitle: "Garment-washed olive-sage overshirt with concealed placket",
      description:
        "Bridging shirt and jacket, the Rohan Overshirt is woven from breathable heavyweight Belgian flax and enzyme-washed for an effortless lived-in softness from day one.",
      fabricCare:
        "100% Heavyweight Belgian Linen (265 GSM). Machine wash cold, line dry.",
      category: "men",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 16500,
      compareAtPriceCents: null,
      images: [
        "/images/prod-men-shirt.jpg",
        "/images/cat-men.jpg",
      ],
      colors: [
        { name: "Sage Olive", hex: "#6E765E" },
        { name: "Alabaster", hex: "#EFECE4" },
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 28,
      sku: "BNP-M-OS07",
      rating: 4.8,
      reviewCount: 2,
      createdAt: "2026-11-17T10:00:00.000Z",
    },
    {
      id: "prod_08",
      slug: "stone-unconstructed-linen-suit",
      name: "Vikram Unconstructed Linen Suit",
      subtitle: "Two-piece relaxed tailoring in breathable stone-taupe twill",
      description:
        "An heirloom take on modern warm-weather tailoring. Unlined jacket with buggy back construction paired with single-pleat relaxed trousers for effortless poise from studio to dinner.",
      fabricCare:
        "65% European Linen, 35% Organic Cotton Twill. Dry clean only.",
      category: "men",
      isNewArrival: false,
      isFeatured: true,
      priceCents: 38000,
      compareAtPriceCents: 44000,
      images: [
        "/images/prod-men-suit.jpg",
        "/images/cat-men.jpg",
      ],
      colors: [
        { name: "Warm Stone", hex: "#C2B6A3" },
        { name: "Midnight Navy", hex: "#1F2633" },
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 10,
      sku: "BNP-M-SU08",
      rating: 4.9,
      reviewCount: 1,
      createdAt: "2026-11-10T10:00:00.000Z",
    },
    {
      id: "prod_09",
      slug: "camel-cashmere-merino-crewneck",
      name: "Kabir Cashmere-Merino Crewneck",
      subtitle: "Saddle-shoulder luxury knit in warm camel ochre",
      description:
        "Spun from Grade-A Inner Mongolian cashmere and superfine merino wool, finished with linked ribbed cuffs and a timeless saddle shoulder construction.",
      fabricCare:
        "30% Cashmere, 70% Extra-Fine Merino Wool. Hand wash cool, dry flat.",
      category: "men",
      isNewArrival: false,
      isFeatured: false,
      priceCents: 19500,
      compareAtPriceCents: null,
      images: ["/images/prod-men-knit.jpg"],
      colors: [
        { name: "Camel Ochre", hex: "#B5834C" },
        { name: "Espresso", hex: "#382923" },
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 22,
      sku: "BNP-M-KN09",
      rating: 4.9,
      reviewCount: 1,
      createdAt: "2026-11-08T10:00:00.000Z",
    },
    {
      id: "prod_10",
      slug: "obsidian-pleated-wool-silk-trouser",
      name: "Aryan Pleated Wool-Silk Trouser",
      subtitle: "Deep double-pleat drape with hidden side-tab waist adjusters",
      description:
        "Cut with generous volume through the thigh tapering gracefully to a clean ankle break. Side waist tabs remove the need for a belt when worn casually or formally.",
      fabricCare:
        "75% Virgin Wool, 25% Tussar Silk. Dry clean only.",
      category: "men",
      isNewArrival: false,
      isFeatured: false,
      priceCents: 18500,
      compareAtPriceCents: null,
      images: ["/images/prod-men-trouser.jpg"],
      colors: [
        { name: "Obsidian Black", hex: "#161616" },
        { name: "Slate Grey", hex: "#505254" },
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 26,
      sku: "BNP-M-TR10",
      rating: 4.7,
      reviewCount: 1,
      createdAt: "2026-11-06T10:00:00.000Z",
    },
    {
      id: "prod_11",
      slug: "espresso-waxed-linen-chore-jacket",
      name: "Tara Architectural Chore Jacket",
      subtitle: "Structured utility workwear reimagined in dry-waxed linen canvas",
      description:
        "Inspired by traditional studio smocks, the Tara Chore Jacket pairs reinforced patch pockets and corozo nut buttons with weather-resistant dry-waxed European linen.",
      fabricCare:
        "100% Dry-Waxed Linen Canvas. Spot clean with damp cloth; do not dry clean.",
      category: "men",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 22500,
      compareAtPriceCents: null,
      images: [
        "/images/prod-unisex-jacket.jpg",
        "/images/cat-new-arrivals.jpg",
      ],
      colors: [
        { name: "Roasted Espresso", hex: "#432F25" },
        { name: "Forest Moss", hex: "#364438" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 19,
      sku: "BNP-U-CJ11",
      rating: 4.9,
      reviewCount: 1,
      createdAt: "2026-11-22T10:00:00.000Z",
    },
    {
      id: "prod_12",
      slug: "handloomed-cashmere-silk-atelier-shawl",
      name: "Veda Hand-Loomed Cashmere Shawl",
      subtitle: "Artisanal Kashmiri weave in ivory & burnt terracotta border",
      description:
        "Woven on traditional wooden pit looms over 18 days by master weavers, the Veda Shawl blends cloud-soft cashmere with luminous mulberry silk in an oversized wrap.",
      fabricCare:
        "65% Pashmina Cashmere, 35% Mulberry Silk. Specialist dry clean only.",
      category: "women",
      isNewArrival: true,
      isFeatured: true,
      priceCents: 21000,
      compareAtPriceCents: 24500,
      images: [
        "/images/prod-unisex-scarf.jpg",
        "/images/cat-new-arrivals.jpg",
      ],
      colors: [
        { name: "Ivory & Terracotta", hex: "#E5D9C8" },
      ],
      sizes: ["One Size"],
      stock: 14,
      sku: "BNP-W-SH12",
      rating: 5.0,
      reviewCount: 2,
      createdAt: "2026-11-23T10:00:00.000Z",
    },
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (
      id, slug, name, subtitle, description, fabricCare, category,
      isNewArrival, isFeatured, priceCents, compareAtPriceCents,
      imagesJson, colorsJson, sizesJson, stock, sku, rating, reviewCount, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProd.run(
      p.id,
      p.slug,
      p.name,
      p.subtitle,
      p.description,
      p.fabricCare,
      p.category,
      p.isNewArrival ? 1 : 0,
      p.isFeatured ? 1 : 0,
      p.priceCents,
      p.compareAtPriceCents,
      JSON.stringify(p.images),
      JSON.stringify(p.colors),
      JSON.stringify(p.sizes),
      p.stock,
      p.sku,
      p.rating,
      p.reviewCount,
      p.createdAt
    );
  }

  // Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, productId, authorName, rating, title, comment, verifiedPurchase, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedReviews = [
    ["rev_01", "prod_01", "Ananya R.", 5, "The drape is museum-worthy", "The raw Tussar silk has a subtle architectural crispness that softens the moment you put it on. Worth every rupee.", 1, "2026-11-21T14:20:00.000Z"],
    ["rev_02", "prod_01", "Elena M.", 5, "Effortless tailoring", "Wore this in Paris and Mumbai—breathable yet structured. The horn buttons and cupro lining feel truly bespoke.", 1, "2026-11-22T09:10:00.000Z"],
    ["rev_03", "prod_01", "Priya S.", 5, "Heirloom piece", "Finally an Indian luxury label with impeccable minimalist finishing.", 1, "2026-11-23T16:40:00.000Z"],
    ["rev_04", "prod_02", "Maya K.", 5, "Terracotta shade glows in daylight", "Bias cut falls cleanly without clinging. Ordered size S and the fit is spot on.", 1, "2026-11-20T12:00:00.000Z"],
    ["rev_05", "prod_02", "Sonal D.", 5, "Pure poetry in silk", "Packaging was sustainable and refined, and the dress feels weightless.", 1, "2026-11-22T18:15:00.000Z"],
    ["rev_06", "prod_03", "Rhea V.", 5, "Sharpest linen blazer I own", "Doesn't crease easily like cheap linen because of the 310 GSM weight.", 1, "2026-11-15T11:30:00.000Z"],
    ["rev_07", "prod_06", "Vikramaditya P.", 5, "Unmatched double-faced wool", "Blind-stitched seams inside are immaculate. Warm without feeling heavy.", 1, "2026-11-22T08:45:00.000Z"],
    ["rev_08", "prod_06", "Daniel H.", 5, "Tailored perfection", "True to size with room for a cashmere knit underneath.", 1, "2026-11-24T10:15:00.000Z"],
    ["rev_09", "prod_07", "Karan B.", 5, "Everyday staple", "The sage-olive tone pairs with literally everything in my closet.", 1, "2026-11-19T15:05:00.000Z"],
    ["rev_10", "prod_12", "Neha G.", 5, "You can feel the handloom craft", "Extraordinarily soft pashmina blend and generous drape.", 1, "2026-11-24T13:20:00.000Z"],
  ] as const;

  for (const r of seedReviews) {
    insertReview.run(...r);
  }

  // Seed Sample Orders (for instant order tracking & admin dashboard richness)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, orderNumber, userId, customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity, shippingPostalCode, shippingCountry,
      shippingMethod, paymentMethod, paymentStatus, paymentIntentId, promoCode,
      subtotalCents, discountCents, shippingCents, taxCents, totalCents,
      status, carrier, trackingCode, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      id, orderId, productId, productSlug, productName, image, color, size, quantity, unitPriceCents
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    "ord_demo_1",
    "BNP-104821",
    claraId,
    "Clara Sen",
    "clara@example.com",
    "+91 98300 55219",
    "42 Park Street, Alipore",
    "Kolkata",
    "700027",
    "India",
    "express",
    "card",
    "Paid",
    "pi_binapani_3Q8xDemo104821",
    "BINAPANI10",
    58500,
    5850,
    0,
    4212,
    56862,
    "In Transit",
    "BlueDart Atelier Express",
    "BD-99481023-IN",
    "2026-11-22T09:30:00.000Z",
    "2026-11-24T14:20:00.000Z"
  );

  insertOrderItem.run(
    "oi_demo_1",
    "ord_demo_1",
    "prod_01",
    "ivory-raw-silk-trench-coat",
    "Aaravya Raw Silk Trench Coat",
    "/images/prod-women-trench.jpg",
    "Ivory Chalk",
    "S",
    1,
    34500
  );
  insertOrderItem.run(
    "oi_demo_2",
    "ord_demo_1",
    "prod_02",
    "terracotta-draped-silk-slip-dress",
    "Nandini Bias-Cut Silk Midi Dress",
    "/images/prod-women-dress.jpg",
    "Terracotta Clay",
    "S",
    1,
    24000
  );

  insertOrder.run(
    "ord_demo_2",
    "BNP-104790",
    arjunId,
    "Arjun Mehta",
    "arjun@example.com",
    "+1 415 555 0198",
    "780 Valencia Street, Apt 4B",
    "San Francisco",
    "94110",
    "United States",
    "express",
    "card",
    "Paid",
    "pi_binapani_3Q8xDemo104790",
    null,
    42000,
    0,
    0,
    3360,
    45360,
    "Delivered",
    "DHL Express Worldwide",
    "DHL-882019442",
    "2026-11-14T16:10:00.000Z",
    "2026-11-19T11:05:00.000Z"
  );

  insertOrderItem.run(
    "oi_demo_3",
    "ord_demo_2",
    "prod_06",
    "charcoal-double-faced-merino-overcoat",
    "Devrat Double-Faced Wool Overcoat",
    "/images/prod-men-overcoat.jpg",
    "Obsidian Charcoal",
    "L",
    1,
    42000
  );

  insertOrder.run(
    "ord_demo_3",
    "BNP-104835",
    claraId,
    "Clara Sen",
    "clara@example.com",
    "+91 98300 55219",
    "42 Park Street, Alipore",
    "Kolkata",
    "700027",
    "India",
    "standard",
    "upi",
    "Paid",
    "pi_binapani_upi_104835",
    null,
    21000,
    0,
    0,
    1680,
    22680,
    "Processing",
    "BlueDart Atelier Express",
    "BD-99482910-IN",
    "2026-11-24T19:45:00.000Z",
    "2026-11-25T08:15:00.000Z"
  );

  insertOrderItem.run(
    "oi_demo_4",
    "ord_demo_3",
    "prod_12",
    "handloomed-cashmere-silk-atelier-shawl",
    "Veda Hand-Loomed Cashmere Shawl",
    "/images/prod-unisex-scarf.jpg",
    "Ivory & Terracotta",
    "One Size",
    1,
    21000
  );
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    subtitle: String(row.subtitle),
    description: String(row.description),
    fabricCare: String(row.fabricCare),
    category: row.category as "women" | "men",
    isNewArrival: Boolean(row.isNewArrival),
    isFeatured: Boolean(row.isFeatured),
    priceCents: Number(row.priceCents),
    compareAtPriceCents:
      row.compareAtPriceCents != null ? Number(row.compareAtPriceCents) : null,
    images: JSON.parse(String(row.imagesJson)),
    colors: JSON.parse(String(row.colorsJson)),
    sizes: JSON.parse(String(row.sizesJson)),
    stock: Number(row.stock),
    sku: String(row.sku),
    rating: Number(row.rating),
    reviewCount: Number(row.reviewCount),
    createdAt: String(row.createdAt),
  };
}

export function listProducts(filters?: {
  category?: string;
  featured?: boolean;
  newArrival?: boolean;
  search?: string;
  sort?: string;
}): Product[] {
  const db = getRawDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.category === "women" || filters?.category === "men") {
    clauses.push("category = ?");
    params.push(filters.category);
  } else if (filters?.category === "new-arrivals" || filters?.newArrival) {
    clauses.push("isNewArrival = 1");
  }

  if (filters?.featured) {
    clauses.push("isFeatured = 1");
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim().toLowerCase()}%`;
    clauses.push(
      "(LOWER(name) LIKE ? OR LOWER(subtitle) LIKE ? OR LOWER(description) LIKE ?)"
    );
    params.push(q, q, q);
  }

  let orderBy = "createdAt DESC";
  if (filters?.sort === "price-asc") orderBy = "priceCents ASC";
  else if (filters?.sort === "price-desc") orderBy = "priceCents DESC";
  else if (filters?.sort === "rating") orderBy = "rating DESC, reviewCount DESC";
  else if (filters?.sort === "featured") orderBy = "isFeatured DESC, createdAt DESC";

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM products ${whereSql} ORDER BY ${orderBy}`)
    .all(...params) as Array<Record<string, unknown>>;

  return rows.map(mapProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const db = getRawDb();
  const row = db
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : null;
}

export function getProductById(id: string): Product | null {
  const db = getRawDb();
  const row = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : null;
}

export function createProduct(input: {
  name: string;
  subtitle: string;
  description: string;
  fabricCare: string;
  category: "women" | "men";
  isNewArrival: boolean;
  isFeatured: boolean;
  priceCents: number;
  compareAtPriceCents?: number | null;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  sku: string;
}): Product {
  const db = getRawDb();
  const id = `prod_${crypto.randomBytes(5).toString("hex")}`;
  const baseSlug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO products (
      id, slug, name, subtitle, description, fabricCare, category,
      isNewArrival, isFeatured, priceCents, compareAtPriceCents,
      imagesJson, colorsJson, sizesJson, stock, sku, rating, reviewCount, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, ?)
  `).run(
    id,
    slug,
    input.name,
    input.subtitle,
    input.description,
    input.fabricCare,
    input.category,
    input.isNewArrival ? 1 : 0,
    input.isFeatured ? 1 : 0,
    input.priceCents,
    input.compareAtPriceCents ?? null,
    JSON.stringify(input.images),
    JSON.stringify(input.colors),
    JSON.stringify(input.sizes),
    input.stock,
    input.sku,
    now
  );

  return getProductById(id)!;
}

export function updateProduct(
  id: string,
  patch: Partial<{
    name: string;
    subtitle: string;
    priceCents: number;
    stock: number;
    isNewArrival: boolean;
    isFeatured: boolean;
    category: "women" | "men";
  }>
): Product | null {
  const db = getRawDb();
  const existing = getProductById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE products
    SET name = ?, subtitle = ?, priceCents = ?, stock = ?,
        isNewArrival = ?, isFeatured = ?, category = ?
    WHERE id = ?
  `).run(
    patch.name ?? existing.name,
    patch.subtitle ?? existing.subtitle,
    patch.priceCents ?? existing.priceCents,
    patch.stock ?? existing.stock,
    (patch.isNewArrival ?? existing.isNewArrival) ? 1 : 0,
    (patch.isFeatured ?? existing.isFeatured) ? 1 : 0,
    patch.category ?? existing.category,
    id
  );

  return getProductById(id);
}

export function deleteProduct(id: string): boolean {
  const db = getRawDb();
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return info.changes > 0;
}

export function getReviewsForProduct(productId: string): Review[] {
  const db = getRawDb();
  const rows = db
    .prepare(
      "SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC"
    )
    .all(productId) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: String(r.id),
    productId: String(r.productId),
    authorName: String(r.authorName),
    rating: Number(r.rating),
    title: String(r.title),
    comment: String(r.comment),
    verifiedPurchase: Boolean(r.verifiedPurchase),
    createdAt: String(r.createdAt),
  }));
}

export function getRecentReviews(limit = 6): Review[] {
  const db = getRawDb();
  const rows = db
    .prepare(`
      SELECT r.*, p.name as productName
      FROM reviews r
      JOIN products p ON r.productId = p.id
      ORDER BY r.createdAt DESC
      LIMIT ?
    `)
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    productId: String(r.productId),
    productName: String(r.productName),
    authorName: String(r.authorName),
    rating: Number(r.rating),
    title: String(r.title),
    comment: String(r.comment),
    verifiedPurchase: Boolean(r.verifiedPurchase),
    createdAt: String(r.createdAt),
  }));
}

export function addReview(input: {
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
}): Review {
  const db = getRawDb();
  const id = `rev_${crypto.randomBytes(5).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO reviews (id, productId, authorName, rating, title, comment, verifiedPurchase, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    id,
    input.productId,
    input.authorName,
    Math.min(5, Math.max(1, Math.round(input.rating))),
    input.title,
    input.comment,
    now
  );

  // Recalculate product rating
  const stats = db
    .prepare(
      "SELECT COUNT(*) as cnt, AVG(rating) as avgRating FROM reviews WHERE productId = ?"
    )
    .get(input.productId) as { cnt: number; avgRating: number };
  db.prepare(
    "UPDATE products SET rating = ?, reviewCount = ? WHERE id = ?"
  ).run(
    Math.round((stats.avgRating || 5) * 10) / 10,
    stats.cnt,
    input.productId
  );

  return {
    id,
    productId: input.productId,
    authorName: input.authorName,
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    verifiedPurchase: true,
    createdAt: now,
  };
}

export function findUserByEmail(
  email: string
): (User & { passwordHash: string }) | null {
  const db = getRawDb();
  const row = db
    .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email.trim()) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.passwordHash),
    role: row.role as "customer" | "admin",
    phone: String(row.phone),
    address: String(row.address),
    city: String(row.city),
    postalCode: String(row.postalCode),
    country: String(row.country),
    createdAt: String(row.createdAt),
  };
}

export function getUserById(id: string): User | null {
  const db = getRawDb();
  const row = db
    .prepare(
      "SELECT id, name, email, role, phone, address, city, postalCode, country, createdAt FROM users WHERE id = ?"
    )
    .get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role as "customer" | "admin",
    phone: String(row.phone),
    address: String(row.address),
    city: String(row.city),
    postalCode: String(row.postalCode),
    country: String(row.country),
    createdAt: String(row.createdAt),
  };
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): User {
  const db = getRawDb();
  const id = `usr_${crypto.randomBytes(5).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (id, name, email, passwordHash, role, phone, address, city, postalCode, country, createdAt)
    VALUES (?, ?, ?, ?, 'customer', ?, '', '', '', 'India', ?)
  `).run(
    id,
    input.name.trim(),
    input.email.trim().toLowerCase(),
    hashPassword(input.password),
    input.phone ?? "",
    now
  );
  return getUserById(id)!;
}

export function updateUserProfile(
  id: string,
  patch: Partial<{
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }>
): User | null {
  const db = getRawDb();
  const existing = getUserById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE users
    SET name = ?, phone = ?, address = ?, city = ?, postalCode = ?, country = ?
    WHERE id = ?
  `).run(
    patch.name ?? existing.name,
    patch.phone ?? existing.phone,
    patch.address ?? existing.address,
    patch.city ?? existing.city,
    patch.postalCode ?? existing.postalCode,
    patch.country ?? existing.country,
    id
  );
  return getUserById(id);
}

function attachItems(db: DatabaseSync, orders: Order[]): Order[] {
  if (orders.length === 0) return [];
  const stmt = db.prepare("SELECT * FROM order_items WHERE orderId = ?");
  return orders.map((order) => {
    const items = stmt.all(order.id) as unknown as OrderItem[];
    return { ...order, items };
  });
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.orderNumber),
    userId: row.userId ? String(row.userId) : null,
    customerName: String(row.customerName),
    customerEmail: String(row.customerEmail),
    customerPhone: String(row.customerPhone),
    shippingAddress: String(row.shippingAddress),
    shippingCity: String(row.shippingCity),
    shippingPostalCode: String(row.shippingPostalCode),
    shippingCountry: String(row.shippingCountry),
    shippingMethod: row.shippingMethod as "standard" | "express",
    paymentMethod: row.paymentMethod as "card" | "upi" | "cod",
    paymentStatus: row.paymentStatus as "Paid" | "Pending" | "Refunded",
    paymentIntentId: String(row.paymentIntentId),
    promoCode: row.promoCode ? String(row.promoCode) : null,
    subtotalCents: Number(row.subtotalCents),
    discountCents: Number(row.discountCents),
    shippingCents: Number(row.shippingCents),
    taxCents: Number(row.taxCents),
    totalCents: Number(row.totalCents),
    status: row.status as OrderStatus,
    carrier: String(row.carrier),
    trackingCode: String(row.trackingCode),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function createOrder(input: {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: "standard" | "express";
  paymentMethod: "card" | "upi" | "cod";
  paymentStatus: "Paid" | "Pending";
  paymentIntentId: string;
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  items: Array<{
    productId: string;
    productSlug: string;
    productName: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
  }>;
}): Order {
  const db = getRawDb();
  const id = `ord_${crypto.randomBytes(6).toString("hex")}`;
  const orderNumber = `BNP-${Math.floor(105000 + Math.random() * 890000)}`;
  const trackingCode = `BD-${Math.floor(10000000 + Math.random() * 89999999)}-IN`;
  const carrier =
    input.shippingMethod === "express"
      ? "BlueDart Atelier Express"
      : "Delhivery Priority Ground";
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (
      id, orderNumber, userId, customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity, shippingPostalCode, shippingCountry,
      shippingMethod, paymentMethod, paymentStatus, paymentIntentId, promoCode,
      subtotalCents, discountCents, shippingCents, taxCents, totalCents,
      status, carrier, trackingCode, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?, ?, ?, ?)
  `).run(
    id,
    orderNumber,
    input.userId,
    input.customerName,
    input.customerEmail.toLowerCase(),
    input.customerPhone,
    input.shippingAddress,
    input.shippingCity,
    input.shippingPostalCode,
    input.shippingCountry,
    input.shippingMethod,
    input.paymentMethod,
    input.paymentStatus,
    input.paymentIntentId,
    input.promoCode,
    input.subtotalCents,
    input.discountCents,
    input.shippingCents,
    input.taxCents,
    input.totalCents,
    carrier,
    trackingCode,
    now,
    now
  );

  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, orderId, productId, productSlug, productName, image, color, size, quantity, unitPriceCents
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const decStock = db.prepare(
    "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?"
  );

  for (const item of input.items) {
    insertItem.run(
      `oi_${crypto.randomBytes(5).toString("hex")}`,
      id,
      item.productId,
      item.productSlug,
      item.productName,
      item.image,
      item.color,
      item.size,
      item.quantity,
      item.unitPriceCents
    );
    decStock.run(item.quantity, item.productId);
  }

  return getOrderByNumber(orderNumber)!;
}

export function getOrderByNumber(
  orderNumber: string,
  email?: string
): Order | null {
  const db = getRawDb();
  const row = email
    ? (db
        .prepare(
          "SELECT * FROM orders WHERE UPPER(orderNumber) = UPPER(?) AND LOWER(customerEmail) = LOWER(?)"
        )
        .get(orderNumber.trim(), email.trim()) as
        | Record<string, unknown>
        | undefined)
    : (db
        .prepare("SELECT * FROM orders WHERE UPPER(orderNumber) = UPPER(?)")
        .get(orderNumber.trim()) as Record<string, unknown> | undefined);

  if (!row) return null;
  return attachItems(db, [mapOrder(row)])[0];
}

export function listOrdersForUser(userId: string, email: string): Order[] {
  const db = getRawDb();
  const rows = db
    .prepare(
      "SELECT * FROM orders WHERE userId = ? OR LOWER(customerEmail) = LOWER(?) ORDER BY createdAt DESC"
    )
    .all(userId, email) as Array<Record<string, unknown>>;
  return attachItems(db, rows.map(mapOrder));
}

export function listAllOrders(): Order[] {
  const db = getRawDb();
  const rows = db
    .prepare("SELECT * FROM orders ORDER BY createdAt DESC")
    .all() as Array<Record<string, unknown>>;
  return attachItems(db, rows.map(mapOrder));
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingCode?: string
): Order | null {
  const db = getRawDb();
  const now = new Date().toISOString();
  if (trackingCode) {
    db.prepare(
      "UPDATE orders SET status = ?, trackingCode = ?, updatedAt = ? WHERE id = ?"
    ).run(status, trackingCode, now, id);
  } else {
    db.prepare(
      "UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?"
    ).run(status, now, id);
  }
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? attachItems(db, [mapOrder(row)])[0] : null;
}

export function addSubscriber(email: string): { created: boolean } {
  const db = getRawDb();
  const existing = db
    .prepare("SELECT id FROM subscribers WHERE LOWER(email) = LOWER(?)")
    .get(email.trim());
  if (existing) return { created: false };
  db.prepare(
    "INSERT INTO subscribers (id, email, createdAt) VALUES (?, ?, ?)"
  ).run(
    `sub_${crypto.randomBytes(5).toString("hex")}`,
    email.trim().toLowerCase(),
    new Date().toISOString()
  );
  return { created: true };
}

export function getAdminMetrics() {
  const db = getRawDb();
  const orders = listAllOrders();
  const products = listProducts();
  const usersCount = (
    db.prepare("SELECT COUNT(*) as cnt FROM users").get() as { cnt: number }
  ).cnt;
  const reviewsCount = (
    db.prepare("SELECT COUNT(*) as cnt FROM reviews").get() as { cnt: number }
  ).cnt;

  const nonCancelled = orders.filter((o) => o.status !== "Cancelled");
  const totalRevenueCents = nonCancelled.reduce(
    (sum, o) => sum + o.totalCents,
    0
  );
  const avgOrderValueCents =
    nonCancelled.length > 0
      ? Math.round(totalRevenueCents / nonCancelled.length)
      : 0;
  const lowStockProducts = products.filter((p) => p.stock <= 15);

  const categorySales: Record<string, number> = { women: 0, men: 0 };
  for (const ord of nonCancelled) {
    for (const item of ord.items ?? []) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        categorySales[prod.category] =
          (categorySales[prod.category] ?? 0) +
          item.unitPriceCents * item.quantity;
      }
    }
  }

  return {
    totalRevenueCents,
    ordersCount: orders.length,
    avgOrderValueCents,
    productsCount: products.length,
    usersCount,
    reviewsCount,
    lowStockProducts,
    categorySales,
    recentOrders: orders.slice(0, 12),
  };
}
