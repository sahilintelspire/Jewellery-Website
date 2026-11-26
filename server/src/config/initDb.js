import bcrypt from 'bcryptjs';
import { execRaw, execute, getDialect, queryOne, upsertSiteSetting } from './db.js';

function getSchemaSql(dialect) {
  const pk =
    dialect === 'mysql'
      ? 'INT AUTO_INCREMENT PRIMARY KEY'
      : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const boolCol = dialect === 'mysql' ? 'TINYINT(1)' : 'INTEGER';
  const tsDefault =
    dialect === 'mysql'
      ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      : 'DATETIME DEFAULT CURRENT_TIMESTAMP';
  const tsUpdate =
    dialect === 'mysql'
      ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      : 'DATETIME DEFAULT CURRENT_TIMESTAMP';
  const strId = dialect === 'mysql' ? 'VARCHAR(160)' : 'TEXT';
  const shortStr = dialect === 'mysql' ? 'VARCHAR(80)' : 'TEXT';
  const textCol = dialect === 'mysql' ? 'TEXT' : 'TEXT';
  const longText = dialect === 'mysql' ? 'LONGTEXT' : 'TEXT';
  const decimalRating = dialect === 'mysql' ? 'DECIMAL(3,2)' : 'REAL';
  const fkSuffix = dialect === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';

  return `
    CREATE TABLE IF NOT EXISTS users (
      id ${pk},
      name ${strId} NOT NULL,
      email ${strId} NOT NULL UNIQUE,
      phone ${shortStr},
      password_hash ${textCol},
      role ${shortStr} NOT NULL DEFAULT 'customer',
      auth_provider ${shortStr} NOT NULL DEFAULT 'email',
      google_sub ${strId},
      avatar_url ${textCol},
      reset_otp ${shortStr},
      reset_expires ${longText},
      created_at ${tsDefault},
      updated_at ${tsUpdate}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS addresses (
      id ${pk},
      user_id INT NOT NULL,
      full_name ${strId} NOT NULL,
      phone ${shortStr} NOT NULL,
      pincode ${shortStr} NOT NULL,
      line1 ${textCol} NOT NULL,
      line2 ${textCol},
      city ${shortStr} NOT NULL,
      state ${shortStr} NOT NULL,
      address_type ${shortStr} NOT NULL DEFAULT 'Home',
      is_default ${boolCol} NOT NULL DEFAULT 0,
      created_at ${tsDefault},
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS categories (
      id ${pk},
      slug ${shortStr} NOT NULL UNIQUE,
      name ${strId} NOT NULL,
      description ${textCol},
      image_url ${textCol},
      sort_order INT NOT NULL DEFAULT 0,
      is_active ${boolCol} NOT NULL DEFAULT 1,
      created_at ${tsDefault}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS products (
      id ${pk},
      slug ${strId} NOT NULL UNIQUE,
      name ${strId} NOT NULL,
      category_slug ${shortStr} NOT NULL,
      price INT NOT NULL,
      original_price INT,
      badge ${shortStr},
      tag ${shortStr},
      description ${textCol} NOT NULL,
      story ${longText},
      materials_json ${longText} NOT NULL,
      sizes_json ${longText} NOT NULL,
      images_json ${longText} NOT NULL,
      stock_qty INT NOT NULL DEFAULT 25,
      is_featured ${boolCol} NOT NULL DEFAULT 0,
      is_active ${boolCol} NOT NULL DEFAULT 1,
      rating ${decimalRating} NOT NULL DEFAULT 5.0,
      review_count INT NOT NULL DEFAULT 0,
      created_at ${tsDefault},
      updated_at ${tsUpdate}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS product_reviews (
      id ${pk},
      product_id INT NOT NULL,
      user_id INT,
      author_name ${strId} NOT NULL,
      rating INT NOT NULL,
      title ${strId},
      comment ${textCol} NOT NULL,
      is_approved ${boolCol} NOT NULL DEFAULT 1,
      created_at ${tsDefault},
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS custom_order_options (
      id ${pk},
      option_group ${shortStr} NOT NULL,
      label ${strId} NOT NULL,
      subtitle ${textCol},
      extra_price INT NOT NULL DEFAULT 0,
      swatch_color ${shortStr},
      image_url ${textCol},
      sort_order INT NOT NULL DEFAULT 0,
      is_active ${boolCol} NOT NULL DEFAULT 1,
      created_at ${tsDefault}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS custom_orders (
      id ${pk},
      request_code ${shortStr} NOT NULL UNIQUE,
      user_id INT,
      customer_name ${strId} NOT NULL,
      customer_email ${strId},
      customer_phone ${shortStr} NOT NULL,
      jewelry_type ${strId} NOT NULL,
      crystal ${strId} NOT NULL,
      budget ${shortStr} NOT NULL,
      finish_style ${strId},
      wrist_size ${shortStr},
      engraving_text ${strId},
      notes ${longText},
      reference_image_url ${textCol},
      estimated_price INT,
      quoted_price INT,
      admin_reply ${longText},
      status ${shortStr} NOT NULL DEFAULT 'Pending Review',
      created_at ${tsDefault},
      updated_at ${tsUpdate}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS coupons (
      id ${pk},
      code ${shortStr} NOT NULL UNIQUE,
      description ${textCol},
      discount_type ${shortStr} NOT NULL,
      discount_value INT NOT NULL DEFAULT 0,
      min_order INT NOT NULL DEFAULT 0,
      max_discount INT,
      usage_limit INT,
      used_count INT NOT NULL DEFAULT 0,
      is_active ${boolCol} NOT NULL DEFAULT 1,
      expires_at ${strId},
      created_at ${tsDefault}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS orders (
      id ${pk},
      order_number ${shortStr} NOT NULL UNIQUE,
      user_id INT,
      customer_name ${strId} NOT NULL,
      customer_email ${strId} NOT NULL,
      customer_phone ${shortStr} NOT NULL,
      shipping_address_json ${longText} NOT NULL,
      gift_note ${textCol},
      velvet_box_upgraded ${boolCol} NOT NULL DEFAULT 0,
      delivery_method ${shortStr} NOT NULL DEFAULT 'standard',
      coupon_code ${shortStr},
      subtotal INT NOT NULL,
      discount_amount INT NOT NULL DEFAULT 0,
      shipping_fee INT NOT NULL DEFAULT 0,
      gift_wrap_fee INT NOT NULL DEFAULT 0,
      total_amount INT NOT NULL,
      payment_method ${shortStr} NOT NULL,
      payment_status ${shortStr} NOT NULL DEFAULT 'pending',
      razorpay_order_id ${strId},
      razorpay_payment_id ${strId},
      razorpay_signature ${textCol},
      order_status ${shortStr} NOT NULL DEFAULT 'Order Placed',
      courier_name ${strId},
      tracking_number ${strId},
      tracking_url ${textCol},
      admin_notes ${longText},
      created_at ${tsDefault},
      updated_at ${tsUpdate}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS order_items (
      id ${pk},
      order_id INT NOT NULL,
      product_id INT,
      product_slug ${strId},
      product_name ${strId} NOT NULL,
      product_image ${textCol},
      selected_size ${shortStr},
      unit_price INT NOT NULL,
      quantity INT NOT NULL,
      line_total INT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key ${shortStr} NOT NULL PRIMARY KEY,
      setting_value ${longText} NOT NULL,
      updated_at ${tsUpdate}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS subscribers (
      id ${pk},
      email ${strId} NOT NULL UNIQUE,
      source ${shortStr} NOT NULL DEFAULT 'newsletter',
      is_active ${boolCol} NOT NULL DEFAULT 1,
      created_at ${tsDefault}
    )${fkSuffix};

    CREATE TABLE IF NOT EXISTS contact_messages (
      id ${pk},
      name ${strId} NOT NULL,
      email ${strId} NOT NULL,
      phone ${shortStr},
      subject ${strId} NOT NULL,
      message ${longText} NOT NULL,
      status ${shortStr} NOT NULL DEFAULT 'New',
      admin_note ${longText},
      created_at ${tsDefault}
    )${fkSuffix};
  `;
}

const DEFAULT_CATEGORIES = [
  { slug: 'bracelets', name: 'Bracelets', description: 'Hand-knotted silk cord & crystal bead bracelets', sort_order: 1 },
  { slug: 'resin', name: 'Resin Charms', description: 'Pressed real flowers preserved in crystal resin', sort_order: 2 },
  { slug: 'necklaces', name: 'Necklaces', description: 'Baroque freshwater pearl & pendant chains', sort_order: 3 },
  { slug: 'couple', name: 'Couple Sets', description: 'Matching keepsake sets with gift packaging', sort_order: 4 },
  { slug: 'earrings', name: 'Earrings', description: 'Delicate botanical & resin drop earrings', sort_order: 5 }
];

const DEFAULT_PRODUCTS = [
  {
    slug: 'rose-quartz-beaded-bracelet',
    name: 'Rose Quartz & Baroque Bracelet',
    category_slug: 'bracelets',
    price: 1499,
    original_price: 1899,
    badge: 'Bestseller',
    tag: 'Signature Piece',
    rating: 4.9,
    review_count: 128,
    stock_qty: 24,
    is_featured: 1,
    description:
      'Hand-threaded with AAA-grade tumbled Rose Quartz, luminous freshwater baroque pearl beads, and warm 18k champagne gold-plated spacer accents.',
    story:
      'Each crystal is ethically sourced and hand-knotted on silk-linen cord over three calm studio hours—made to carry warmth against your wrist.',
    materials: ['AAA Madagascar Rose Quartz', 'Freshwater Pearl', '18k Gold-Plated Brass', 'Hand-knotted Silk Cord'],
    sizes: ['Small (6.0 in / 15 cm)', 'Standard (6.5 in / 16.5 cm)', 'Medium (7.0 in / 18 cm)', 'Custom Fit (Adjust Note)'],
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    slug: 'pressed-flower-resin-pendant',
    name: 'Pressed Sakura Resin Locket',
    category_slug: 'resin',
    price: 1299,
    original_price: 1599,
    badge: 'New Drop',
    tag: 'One of One',
    rating: 5.0,
    review_count: 86,
    stock_qty: 16,
    is_featured: 1,
    description:
      'Real pressed botanical sakura blooms and delicate 24k gold leaf flakes suspended in crystal-clear UV-resistant artisan resin.',
    story:
      'Picked during spring bloom, dried slowly between cotton sheets for 14 days, and poured in three ultra-thin glass-clear coats.',
    materials: ['Real Pressed Sakura Blossom', 'Botanical Resin', '24k Gold Leaf Flakes', 'Champagne Steel Chain (18 in)'],
    sizes: ['16 in (Choker)', '18 in (Classic)', '20 in (Long)'],
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    slug: 'baroque-pearl-initial-necklace',
    name: 'Freshwater Pearl Thread Choker',
    category_slug: 'necklaces',
    price: 1699,
    original_price: 2199,
    badge: 'Hand-Knotted',
    tag: 'Heirloom Glow',
    rating: 4.8,
    review_count: 64,
    stock_qty: 18,
    is_featured: 1,
    description:
      'Organic freshwater pearls spaced along a fine spun-gold thread choker with an optional hammered initial tag crafted in studio.',
    story:
      'No two pearls share the exact same silhouette—celebrating organic beauty with a weightless, barely-there golden collarbone gleam.',
    materials: ['Natural Freshwater Pearls', '18k Vermeil Clasp', 'Waxed Micro-Silk Cord', 'Optional Hand-Stamped Disc'],
    sizes: ['15 in + Extender', '16.5 in + Extender', '18 in + Extender'],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    slug: 'amethyst-celestial-tassel-bracelet',
    name: 'Amethyst & Raw Citrine Bracelet',
    category_slug: 'bracelets',
    price: 1399,
    original_price: null,
    badge: 'Calm Edit',
    tag: 'Limited Batch',
    rating: 4.9,
    review_count: 42,
    stock_qty: 14,
    is_featured: 1,
    description:
      'Hand-wrapped lavender Amethyst and sun-warmed honey Citrine beads paired with tiny satin-finish gold crescent charms.',
    story:
      'Designed for tranquil evening routines—pairing serene violet clarity with warm golden reflection.',
    materials: ['Natural Faceted Amethyst', 'Honey Citrine', 'Champagne Brass Moon Charm', 'Adjustable Sliding Knot'],
    sizes: ['Free Size (Adjustable 5.8 - 8.0 in)'],
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    slug: 'bespoke-magnetic-couple-bands',
    name: 'Custom Initial Couple Threads',
    category_slug: 'couple',
    price: 1899,
    original_price: 2499,
    badge: 'Gift Favorite',
    tag: 'Set of Two',
    rating: 5.0,
    review_count: 156,
    stock_qty: 30,
    is_featured: 1,
    description:
      'Pair of custom-engraved rose quartz & matte onyx woven silk bands united by subtle magnetic champagne charms in a velvet keepsake box.',
    story:
      'Our most-gifted keepsake for anniversaries and milestones—stamped with two initials and boxed in blush suede.',
    materials: ['Rose Quartz & Matte Onyx', '18k Magnetic Charms', 'Hand-Woven Waterproof Cord', 'Velvet Twin Gift Box'],
    sizes: ['Standard Couple Fit (Adjustable)', 'Custom Engraved Measurements'],
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    slug: 'vintage-floral-resin-earrings',
    name: 'Blush Botanical Drop Earrings',
    category_slug: 'resin',
    price: 999,
    original_price: 1299,
    badge: 'Featherlight',
    tag: 'Artisan Pour',
    rating: 4.9,
    review_count: 73,
    stock_qty: 20,
    is_featured: 1,
    description:
      'Feather-light translucent petal drops encasing wild Queen Anne lace flowers with hypoallergenic 18k gold-plated posts.',
    story:
      'Poured carefully into dome silhouettes so sunlight dances softly behind every delicate dried petal.',
    materials: ['Dried Wildflowers', 'Featherlight Gloss Resin', 'Hypoallergenic 18k Posts'],
    sizes: ['Standard Drop (2.4 cm)'],
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80'
    ]
  }
];

const DEFAULT_CUSTOM_OPTIONS = [
  // Jewellery Types
  { option_group: 'jewellery_type', label: 'Bracelet', subtitle: 'Hand-knotted silk cord or pearl stretch', extra_price: 699, sort_order: 1 },
  { option_group: 'jewellery_type', label: 'Resin Pendant', subtitle: 'Real dried flowers sealed in crystal resin', extra_price: 899, sort_order: 2 },
  { option_group: 'jewellery_type', label: 'Couple Bands', subtitle: 'Matching pair with engraved initials & gift box', extra_price: 1299, sort_order: 3 },
  { option_group: 'jewellery_type', label: 'Pearl Choker', subtitle: 'Organic freshwater pearl collar necklace', extra_price: 1399, sort_order: 4 },
  { option_group: 'jewellery_type', label: 'Charm Anklet', subtitle: 'Delicate waterproof summer thread & beads', extra_price: 599, sort_order: 5 },
  // Crystals & Elements
  { option_group: 'crystal_element', label: 'Rose Quartz (Love & Healing)', subtitle: 'Soft blush pink AAA bead', extra_price: 150, swatch_color: '#F3DAD5', sort_order: 1 },
  { option_group: 'crystal_element', label: 'Raw Amethyst (Peace)', subtitle: 'Lavender tranquil stone', extra_price: 180, swatch_color: '#C7B8EA', sort_order: 2 },
  { option_group: 'crystal_element', label: 'Freshwater Baroque Pearl', subtitle: 'Organic creamy shimmer', extra_price: 250, swatch_color: '#F8F4EC', sort_order: 3 },
  { option_group: 'crystal_element', label: 'Botanical Real Flower', subtitle: 'Pressed sakura or baby’s breath bloom', extra_price: 200, swatch_color: '#FADADD', sort_order: 4 },
  { option_group: 'crystal_element', label: 'Custom Initials', subtitle: 'Hand-stamped gold charm tag', extra_price: 120, swatch_color: '#D4AF37', sort_order: 5 },
  // Finish Styles
  { option_group: 'finish_style', label: 'Champagne Gold Hardware', subtitle: 'Warm 18k anti-tarnish gold plating', extra_price: 100, swatch_color: '#D4AF37', sort_order: 1 },
  { option_group: 'finish_style', label: 'Blush Silk Cord', subtitle: 'Hand-braided soft ivory/blush thread', extra_price: 0, swatch_color: '#EBD3CE', sort_order: 2 },
  { option_group: 'finish_style', label: '24K Gold Leaf Flakes', subtitle: 'Floating metallic flecks inside resin', extra_price: 150, swatch_color: '#E5C76B', sort_order: 3 },
  // Budgets
  { option_group: 'budget_tier', label: 'Under ₹999', subtitle: 'Delicate minimalist everyday keepsake', extra_price: 0, sort_order: 1 },
  { option_group: 'budget_tier', label: '₹1,000 - ₹2,000', subtitle: 'Signature stones, initials & gift box', extra_price: 0, sort_order: 2 },
  { option_group: 'budget_tier', label: '₹2,000+ Luxury', subtitle: 'Multi-layer heirloom sets & twin boxes', extra_price: 0, sort_order: 3 }
];

const DEFAULT_COUPONS = [
  { code: 'AURA10', description: '10% Studio Welcome Privilege', discount_type: 'percent', discount_value: 10, min_order: 0, max_discount: 500 },
  { code: 'WELCOME200', description: '₹200 Off on First Keepsake Order', discount_type: 'flat', discount_value: 200, min_order: 999, max_discount: 200 },
  { code: 'FREESHIP', description: 'Complimentary Studio Courier Shipping', discount_type: 'freeship', discount_value: 0, min_order: 0, max_discount: null }
];

const DEFAULT_SETTINGS = {
  brand_name: 'AURA JEWELS',
  announcement_enabled: 'true',
  announcement_text: 'Complimentary Velvet Jewelry Box on orders above ₹999 ✨ Handmade in India',
  hero_eyebrow: 'Artisan Jewelry Studio',
  hero_title: 'Handcrafted Serenity, Worn Close.',
  hero_subtitle: 'Small-batch crystals, pressed sakura botanicals & baroque pearls hand-knotted with warmth in India.',
  hero_cta_text: 'Explore Signature Drop',
  hero_badge_text: 'Bespoke Studio Open • 48h Dispatch',
  free_gift_threshold: '999',
  free_shipping_threshold: '999',
  standard_shipping_fee: '80',
  express_shipping_fee: '120',
  velvet_box_upgrade_fee: '99',
  cod_enabled: 'true',
  razorpay_enabled: 'true',
  whatsapp_number: '918780125711',
  support_email: 'hello@aurajewels.in',
  instagram_handle: '@aurajewels.in',
  instagram_url: 'https://instagram.com',
  studio_location: 'Ahmedabad Atelier, Gujarat, India',
  dispatch_promise: 'Dispatched within 48 hours in velvet keepsake packaging'
};

/**
 * Create tables if needed and idempotently seed initial storefront data.
 */
export async function initializeSchemaAndSeed() {
  const dialect = getDialect();
  await execRaw(getSchemaSql(dialect));

  // Seed default Admin user if no admin exists
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aurajewels.in').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AuraStudio@2026';
  const adminName = process.env.ADMIN_NAME || 'Aura Studio Admin';

  const existingAdmin = await queryOne('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await execute(
      `INSERT INTO users (name, email, phone, password_hash, role, auth_provider)
       VALUES (?, ?, ?, ?, 'admin', 'email')`,
      [adminName, adminEmail, '9876543210', hash]
    );
  }

  // Seed Categories if empty
  const catCountRow = await queryOne('SELECT COUNT(*) AS cnt FROM categories');
  if (Number(catCountRow?.cnt || 0) === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await execute(
        `INSERT INTO categories (slug, name, description, sort_order, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [cat.slug, cat.name, cat.description, cat.sort_order]
      );
    }
  }

  // Seed Products if empty
  const prodCountRow = await queryOne('SELECT COUNT(*) AS cnt FROM products');
  if (Number(prodCountRow?.cnt || 0) === 0) {
    for (const prod of DEFAULT_PRODUCTS) {
      await execute(
        `INSERT INTO products (
          slug, name, category_slug, price, original_price, badge, tag,
          description, story, materials_json, sizes_json, images_json,
          stock_qty, is_featured, is_active, rating, review_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          prod.slug,
          prod.name,
          prod.category_slug,
          prod.price,
          prod.original_price,
          prod.badge,
          prod.tag,
          prod.description,
          prod.story,
          JSON.stringify(prod.materials),
          JSON.stringify(prod.sizes),
          JSON.stringify(prod.images),
          prod.stock_qty,
          prod.is_featured,
          prod.rating,
          prod.review_count
        ]
      );
    }
  }

  // Seed Custom Order Studio Options if empty
  const optCountRow = await queryOne('SELECT COUNT(*) AS cnt FROM custom_order_options');
  if (Number(optCountRow?.cnt || 0) === 0) {
    for (const opt of DEFAULT_CUSTOM_OPTIONS) {
      await execute(
        `INSERT INTO custom_order_options (
          option_group, label, subtitle, extra_price, swatch_color, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          opt.option_group,
          opt.label,
          opt.subtitle || '',
          opt.extra_price || 0,
          opt.swatch_color || null,
          opt.sort_order || 0
        ]
      );
    }
  }

  // Seed Promo Coupons if empty
  const couponCountRow = await queryOne('SELECT COUNT(*) AS cnt FROM coupons');
  if (Number(couponCountRow?.cnt || 0) === 0) {
    for (const c of DEFAULT_COUPONS) {
      await execute(
        `INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_discount, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [c.code, c.description, c.discount_type, c.discount_value, c.min_order, c.max_discount]
      );
    }
  }

  // Seed missing Site Settings keys safely without overwriting existing admin edits
  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await queryOne('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
    if (!existing) {
      await upsertSiteSetting(key, val);
    }
  }
}
