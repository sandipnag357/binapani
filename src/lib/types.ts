export type CategorySlug = "women" | "men" | "new-arrivals";

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  fabricCare: string;
  category: "women" | "men";
  isNewArrival: boolean;
  isFeatured: boolean;
  priceCents: number;
  compareAtPriceCents: number | null;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

export type OrderStatus =
  | "Placed"
  | "Processing"
  | "Shipped"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
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
  paymentStatus: "Paid" | "Pending" | "Refunded";
  paymentIntentId: string;
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  status: OrderStatus;
  carrier: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  color: string;
  size: string;
  quantity: number;
}
