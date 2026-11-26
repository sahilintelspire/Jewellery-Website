/**
 * Parse a JSON string safely with fallback.
 */
export function safeParseJson(value, fallback = []) {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Transform a raw products DB row into storefront-compatible API shape.
 * Preserves string `id` alias alongside numeric `dbId` for existing React routes.
 */
export function serializeProduct(row) {
  if (!row) return null;
  const images = safeParseJson(row.images_json, []);
  const materials = safeParseJson(row.materials_json, []);
  const sizes = safeParseJson(row.sizes_json, []);

  return {
    dbId: Number(row.id),
    id: row.slug,
    slug: row.slug,
    name: row.name,
    shortName: row.name,
    category: row.category_slug,
    categorySlug: row.category_slug,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    badge: row.badge || null,
    tag: row.tag || null,
    description: row.description,
    story: row.story || '',
    materials,
    sizes,
    image: images[0] || '',
    images,
    gallery: images,
    leadTime: 'Handcrafted in Studio • Dispatched within 48 hours',
    stockQty: Number(row.stock_qty ?? 0),
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    rating: Number(row.rating ?? 5.0),
    reviews: Number(row.review_count ?? 0),
    reviewsCount: Number(row.review_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Sanitize user DB record before sending to client (strips sensitive hashes/OTPs).
 */
export function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role || 'customer',
    authProvider: row.auth_provider || 'email',
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at
  };
}

/**
 * Normalize site_settings rows into a typed configuration object.
 */
export function formatSettingsMap(rows = []) {
  const map = {};
  for (const row of rows) {
    map[row.setting_key] = row.setting_value;
  }
  return {
    ...map,
    announcement_enabled: map.announcement_enabled === 'true' || map.announcement_enabled === true,
    cod_enabled: map.cod_enabled !== 'false',
    razorpay_enabled: map.razorpay_enabled !== 'false',
    free_gift_threshold: Number(map.free_gift_threshold || 999),
    free_shipping_threshold: Number(map.free_shipping_threshold || 999),
    standard_shipping_fee: Number(map.standard_shipping_fee || 80),
    express_shipping_fee: Number(map.express_shipping_fee || 120),
    velvet_box_upgrade_fee: Number(map.velvet_box_upgrade_fee || 99)
  };
}
