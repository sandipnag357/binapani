"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (
    productId: string,
    color: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "binapani_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      // ignore storage read error
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage write error
    }
  }, [items, hydrated]);

  const addItem = (incoming: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === incoming.productId &&
          i.color === incoming.color &&
          i.size === incoming.size
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(20, next[idx].quantity + incoming.quantity),
        };
        return next;
      }
      return [...prev, incoming];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, color: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(i.productId === productId && i.color === color && i.size === size)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    color: string,
    size: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, color, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.color === color && i.size === size
          ? { ...i, quantity: Math.min(20, quantity) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
