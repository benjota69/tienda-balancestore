// Autenticación del carrito, guardando en el LocalStorage el carrito.

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const CART_KEY = "cart_items";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  function addToCart(product) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = Math.min((next[idx].qty || 1) + 1, Math.min(product.stock ?? 10, 10));
        next[idx] = { ...next[idx], qty: newQty };
        return next;
      }
      const maxStock = Math.min(product.stock ?? 10, 10);
      return [...prev, { id: product.id, title: product.title, price: product.price || 0, image: product.image, qty: Math.min(1, maxStock) }];
    });
  }

  function removeFromCart(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function increase(id, stock = 10) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min((i.qty || 1) + 1, Math.min(stock, 10)) } : i));
  }

  function decrease(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max((i.qty || 1) - 1, 1) } : i));
  }

  function clearCart() { setItems([]); }

  const count = items.reduce((sum, i) => sum + (i.qty || 1), 0);
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, increase, decrease, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }


