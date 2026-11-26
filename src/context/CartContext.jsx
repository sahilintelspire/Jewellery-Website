import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';

const CartContext = createContext();

const FALLBACK_BRACELET_IMG =
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80';
const BROKEN_IMG_FRAGMENT = 'photo-1611591475152-478311382490';

export function CartProvider({ children }) {
  const { settings } = useStore();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_jewels_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item && typeof item === 'object')
            .map((item) =>
              item.image && item.image.includes(BROKEN_IMG_FRAGMENT)
                ? { ...item, image: FALLBACK_BRACELET_IMG }
                : item
            );
        }
      }
      return [
        {
          id: 'rose-quartz-beaded-bracelet',
          name: 'Rose Quartz & Baroque Pearl Bracelet',
          shortName: 'Rose Quartz Beaded Bracelet',
          price: 1499,
          originalPrice: 1999,
          image: FALLBACK_BRACELET_IMG,
          size: 'Standard (6.5 in / 16.5 cm)',
          initial: 'S',
          quantity: 1,
        },
      ];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_jewels_wishlist');
      const parsed = saved ? JSON.parse(saved) : ['pressed-flower-resin-pendant'];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('aura_jewels_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_jewels_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const addToCart = (product, size = 'Standard (6.5 in / 16.5 cm)', initial = '', quantity = 1, openDrawer = true) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size && item.initial === initial
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          shortName: product.shortName || product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image || product.images?.[0] || FALLBACK_BRACELET_IMG,
          size,
          initial,
          quantity,
        },
      ];
    });
    if (openDrawer) setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setGiftNote('');
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeGiftThreshold = Number(settings.free_gift_threshold || 999);
  const isFreeGiftUnlocked = cartSubtotal >= freeGiftThreshold;
  const giftProgress = Math.min((cartSubtotal / freeGiftThreshold) * 100, 100);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        giftNote,
        setGiftNote,
        wishlist,
        toggleWishlist,
        clearWishlist,
        isWishlisted,
        isFreeGiftUnlocked,
        giftProgress,
        freeGiftThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
