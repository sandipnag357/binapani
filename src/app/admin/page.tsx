"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Box,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";

interface Metrics {
  totalRevenueCents: number;
  ordersCount: number;
  avgOrderValueCents: number;
  productsCount: number;
  usersCount: number;
  reviewsCount: number;
  lowStockProducts: Product[];
  categorySales: Record<string, number>;
  recentOrders: Order[];
}

const ORDER_STATUSES: OrderStatus[] = [
  "Placed",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
  "Cancelled",
];

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");

  // New Product Form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<"women" | "men">("women");
  const [newPriceDollars, setNewPriceDollars] = useState("260");
  const [newStock, setNewStock] = useState("20");
  const [newIsArrival, setNewIsArrival] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setProducts(data.products);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchDashboard();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, fetchDashboard]);

  const handleOrderStatusChange = async (
    orderId: string,
    status: OrderStatus
  ) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchDashboard();
    }
  };

  const handleStockAdjust = async (productId: string, nextStock: number) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Math.max(0, nextStock) }),
    });
    if (res.ok) {
      await fetchDashboard();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchDashboard();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          subtitle: newSubtitle,
          description: newDesc,
          category: newCategory,
          priceCents: Math.round(Number(newPriceDollars) * 100),
          stock: Number(newStock),
          isNewArrival: newIsArrival,
          isFeatured: true,
          images: [
            newCategory === "women"
              ? "/images/prod-women-trench.jpg"
              : "/images/prod-men-overcoat.jpg",
          ],
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewSubtitle("");
        setNewDesc("");
        setShowNewForm(false);
        await fetchDashboard();
      }
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-[#6F6A63]">
        Loading BINAPANI Atelier Operations...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl font-medium text-[#141414]">
          Atelier Admin Access Required
        </h1>
        <p className="mt-3 text-sm text-[#6F6A63]">
          Sign in with the administrator account (<code>admin@binapani.com</code>{" "}
          / <code>admin123</code>) or use the one-click Demo Admin button on
          the sign-in page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-[#141414] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const womenSales = metrics?.categorySales.women || 0;
  const menSales = metrics?.categorySales.men || 0;
  const totalCatSales = Math.max(1, womenSales + menSales);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD5] pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#9A5B3A] uppercase">
            BINAPANI Operations Suite
          </p>
          <h1 className="font-editorial mt-1 text-4xl font-medium text-[#141414]">
            Atelier Admin Dashboard
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab("products");
            setShowNewForm(!showNewForm);
          }}
          className="inline-flex items-center gap-2 bg-[#141414] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#9A5B3A]"
        >
          <Plus className="h-4 w-4" /> Add New Garment
        </button>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#E6DFD5] bg-white p-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              <span>Gross Revenue</span>
              <DollarSign className="h-4 w-4 text-[#9A5B3A]" />
            </div>
            <p className="font-editorial mt-3 text-4xl font-semibold text-[#141414]">
              {formatPrice(metrics.totalRevenueCents)}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Across {metrics.ordersCount} orders
            </p>
          </div>

          <div className="border border-[#E6DFD5] bg-white p-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              <span>Avg. Order Value</span>
              <ShoppingBag className="h-4 w-4 text-[#9A5B3A]" />
            </div>
            <p className="font-editorial mt-3 text-4xl font-semibold text-[#141414]">
              {formatPrice(metrics.avgOrderValueCents)}
            </p>
            <p className="mt-1 text-xs text-[#6F6A63]">
              {metrics.usersCount} registered clients
            </p>
          </div>

          <div className="border border-[#E6DFD5] bg-white p-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              <span>Active Catalog</span>
              <Box className="h-4 w-4 text-[#9A5B3A]" />
            </div>
            <p className="font-editorial mt-3 text-4xl font-semibold text-[#141414]">
              {metrics.productsCount}
            </p>
            <p className="mt-1 text-xs text-[#6F6A63]">
              {metrics.reviewsCount} verified reviews
            </p>
          </div>

          <div className="border border-[#E6DFD5] bg-white p-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6F6A63] uppercase">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="h-4 w-4 text-[#9A5B3A]" />
            </div>
            <p className="font-editorial mt-3 text-4xl font-semibold text-[#9A5B3A]">
              {metrics.lowStockProducts.length}
            </p>
            <p className="mt-1 text-xs text-[#6F6A63]">
              Pieces with ≤15 units left
            </p>
          </div>
        </div>
      )}

      {/* Category Revenue Split Bar */}
      {metrics && (
        <div className="mt-6 border border-[#E6DFD5] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#141414] uppercase">
              <BarChart3 className="h-4 w-4 text-[#9A5B3A]" /> Revenue by
              Collection
            </h2>
            <span className="text-xs text-[#6F6A63]">
              Women {Math.round((womenSales / totalCatSales) * 100)}% · Men{" "}
              {Math.round((menSales / totalCatSales) * 100)}%
            </span>
          </div>
          <div className="mt-3 flex h-3 w-full overflow-hidden bg-[#EAE4DC]">
            <div
              className="bg-[#9A5B3A]"
              style={{ width: `${(womenSales / totalCatSales) * 100}%` }}
            />
            <div
              className="bg-[#141414]"
              style={{ width: `${(menSales / totalCatSales) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#6F6A63]">
            <span>Women&apos;s Atelier: {formatPrice(womenSales)}</span>
            <span>Men&apos;s Tailoring: {formatPrice(menSales)}</span>
          </div>
        </div>
      )}

      {/* Create Product Modal/Panel */}
      {showNewForm && (
        <form
          onSubmit={handleCreateProduct}
          className="mt-8 space-y-4 border border-[#141414] bg-white p-6"
        >
          <h2 className="font-editorial text-2xl font-medium">
            Create New Garment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Garment Name (e.g. Ira Handloom Cape)"
              className="border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
            />
            <input
              type="text"
              required
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Short Subtitle"
              className="border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
            />
            <select
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as "women" | "men")
              }
              className="border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                required
                min={10}
                value={newPriceDollars}
                onChange={(e) => setNewPriceDollars(e.target.value)}
                placeholder="Price ($)"
                className="border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
              />
              <input
                type="number"
                required
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Stock"
                className="border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
          <textarea
            required
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Editorial description & craftsmanship details..."
            className="w-full border border-[#D4CCC2] px-3.5 py-2.5 text-sm"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={newIsArrival}
                onChange={(e) => setNewIsArrival(e.target.checked)}
              />
              Feature in New Arrivals
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="border border-[#D4CCC2] px-4 py-2 text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-[#141414] px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-[#9A5B3A]"
              >
                {creating ? "Publishing..." : "Publish Garment"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-[#E6DFD5]">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold tracking-[0.14em] uppercase ${
            activeTab === "orders"
              ? "border-[#141414] text-[#141414]"
              : "border-transparent text-[#6F6A63]"
          }`}
        >
          <Package className="h-4 w-4" /> Orders &amp; Fulfillment (
          {metrics?.recentOrders.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold tracking-[0.14em] uppercase ${
            activeTab === "products"
              ? "border-[#141414] text-[#141414]"
              : "border-transparent text-[#6F6A63]"
          }`}
        >
          <Box className="h-4 w-4" /> Inventory &amp; Catalog ({products.length})
        </button>
      </div>

      {/* Orders Table */}
      {activeTab === "orders" && metrics && (
        <div className="mt-6 overflow-x-auto border border-[#E6DFD5] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6DFD5] bg-[#FAF8F5] text-[#6F6A63] uppercase">
                <th className="px-4 py-3.5">Order</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {metrics.recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF8F5]/60">
                  <td className="px-4 py-4 font-semibold text-[#141414]">
                    <Link
                      href={`/track-order?orderNumber=${ord.orderNumber}`}
                      className="underline underline-offset-4 hover:text-[#9A5B3A]"
                    >
                      {ord.orderNumber}
                    </Link>
                    <p className="mt-0.5 text-[11px] font-normal text-[#6F6A63]">
                      {ord.trackingCode}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-[#141414]">
                      {ord.customerName}
                    </p>
                    <p className="text-[#6F6A63]">{ord.customerEmail}</p>
                  </td>
                  <td className="px-4 py-4 text-[#6F6A63]">
                    {formatDate(ord.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="uppercase">{ord.paymentMethod}</span> ·{" "}
                    <span className="font-medium text-emerald-700">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {formatPrice(ord.totalCents)}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        handleOrderStatusChange(
                          ord.id,
                          e.target.value as OrderStatus
                        )
                      }
                      className="border border-[#D4CCC2] bg-white px-2.5 py-1.5 text-xs font-medium focus:border-[#141414] focus:outline-none"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Table */}
      {activeTab === "products" && (
        <div className="mt-6 overflow-x-auto border border-[#E6DFD5] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6DFD5] bg-[#FAF8F5] text-[#6F6A63] uppercase">
                <th className="px-4 py-3.5">Garment</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5]/60">
                  <td className="px-4 py-3.5 font-medium text-[#141414]">
                    <Link
                      href={`/product/${p.slug}`}
                      className="hover:text-[#9A5B3A]"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-[#6F6A63]">{p.sku}</td>
                  <td className="px-4 py-3.5 capitalize">{p.category}</td>
                  <td className="px-4 py-3.5 font-semibold">
                    {formatPrice(p.priceCents)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(p.id, p.stock - 1)}
                        className="border border-[#D4CCC2] px-2 py-0.5 hover:bg-[#EAE4DC]"
                      >
                        −
                      </button>
                      <span
                        className={`w-7 text-center font-semibold ${
                          p.stock <= 15 ? "text-[#9A5B3A]" : ""
                        }`}
                      >
                        {p.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(p.id, p.stock + 5)}
                        className="border border-[#D4CCC2] px-2 py-0.5 hover:bg-[#EAE4DC]"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-[#9B958E] hover:text-red-600"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
