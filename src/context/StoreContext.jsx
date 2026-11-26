import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '../data/products';
import { storefrontApi } from '../services/api';

const StoreContext = createContext(null);

const DEFAULT_SETTINGS = {
  brand_name: 'AURA JEWELS',
  announcement_enabled: true,
  announcement_text: 'Complimentary Velvet Jewelry Box on orders above ₹999 ✨ Handmade in India',
  hero_eyebrow: 'Artisan Jewelry Studio',
  hero_title: 'Handcrafted Serenity, Worn Close.',
  hero_subtitle:
    'Small-batch crystals, pressed sakura botanicals & baroque pearls hand-knotted with warmth in India.',
  hero_cta_text: 'Explore Signature Drop',
  hero_badge_text: 'Bespoke Studio Open • 48h Dispatch',
  free_gift_threshold: 999,
  free_shipping_threshold: 999,
  standard_shipping_fee: 80,
  express_shipping_fee: 120,
  velvet_box_upgrade_fee: 99,
  cod_enabled: true,
  razorpay_enabled: true,
  whatsapp_number: '918780125711',
  support_email: 'hello@aurajewels.in',
  instagram_handle: '@aurajewels.in',
  instagram_url: 'https://instagram.com',
  studio_location: 'Ahmedabad Atelier, Gujarat, India',
  dispatch_promise: 'Dispatched within 48 hours in velvet keepsake packaging'
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [integrations, setIntegrations] = useState({
    razorpayConfigured: false,
    razorpayKeyId: null,
    googleClientId: null
  });
  const [customConfig, setCustomConfig] = useState({
    jewelleryTypes: [],
    crystals: [],
    finishes: [],
    budgets: []
  });
  const [storeReady, setStoreReady] = useState(false);

  const refreshStore = useCallback(async () => {
    try {
      const [settingsRes, categoriesRes, productsRes, customRes] = await Promise.all([
        storefrontApi.getSettings(),
        storefrontApi.getCategories(),
        storefrontApi.getProducts(),
        storefrontApi.getCustomConfig()
      ]);

      if (settingsRes?.settings) {
        setSettings((prev) => ({ ...prev, ...settingsRes.settings }));
      }
      if (settingsRes?.integrations) {
        setIntegrations(settingsRes.integrations);
      }
      const catNameMap = new Map();
      if (Array.isArray(categoriesRes?.categories)) {
        const dynamicCats = categoriesRes.categories.map((c) => {
          catNameMap.set(c.slug, c.name);
          return {
            ...c,
            id: c.slug,
            label: c.name,
            dbId: c.id
          };
        });
        setCategories([{ id: 'all', slug: 'all', name: 'All Creations', label: 'All Creations' }, ...dynamicCats]);
      }
      if (Array.isArray(productsRes?.products)) {
        setProducts(
          productsRes.products.map((p) => ({
            ...p,
            image: p.image || p.images?.[0] || '',
            shortName: p.shortName || p.name,
            reviewsCount: p.reviewsCount ?? p.reviews ?? 0,
            categoryLabel: catNameMap.get(p.categorySlug) || p.categorySlug,
            featuredInMockup: p.isFeatured
          }))
        );
      }
      if (customRes) {
        setCustomConfig(customRes);
      }
    } catch (err) {
      console.warn('[StoreContext] Using local fallback data:', err.message);
    } finally {
      setStoreReady(true);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const featuredProducts = products.filter((p) => p.isFeatured !== false).slice(0, 6);

  return (
    <StoreContext.Provider
      value={{
        products,
        featuredProducts,
        categories,
        settings,
        integrations,
        customConfig,
        storeReady,
        refreshStore
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
