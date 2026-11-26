import express from 'express';
import { execute, query, queryOne } from '../config/db.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { serializeProduct } from '../utils/json.js';
import { slugify } from '../utils/slug.js';

const router = express.Router();

const SORT_MAP = {
  featured: 'is_featured DESC, id ASC',
  newest: 'id DESC',
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id ASC',
  rating: 'rating DESC, review_count DESC'
};

function sanitizeStringList(input) {
  if (Array.isArray(input)) {
    return input.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

async function recalculateProductRating(productId) {
  const stats = await queryOne(
    `SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 5.0) AS avg_rating
     FROM product_reviews
     WHERE product_id = ? AND is_approved = 1`,
    [productId]
  );
  const cnt = Number(stats?.cnt || 0);
  const avg = cnt > 0 ? Number(Number(stats.avg_rating).toFixed(1)) : 5.0;
  await execute('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [avg, cnt, productId]);
}

async function resolveUniqueSlug(baseName, excludeId = null) {
  let candidate = slugify(baseName) || `creation-${Date.now()}`;
  let suffix = 1;
  while (true) {
    const existing = await queryOne('SELECT id FROM products WHERE slug = ?', [candidate]);
    if (!existing || (excludeId && Number(existing.id) === Number(excludeId))) {
      return candidate;
    }
    suffix += 1;
    candidate = `${slugify(baseName) || 'creation'}-${suffix}`;
  }
}

/**
 * GET /api/products — Public product catalog with search, category, featured, and sort filters.
 */
router.get(
  '/products',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { category, search, featured, sort = 'featured', includeInactive } = req.query;
    const isAdminViewer = req.user?.role === 'admin' && includeInactive === 'true';

    const clauses = [];
    const params = [];

    if (!isAdminViewer) {
      clauses.push('is_active = 1');
    }
    if (category && category !== 'all') {
      clauses.push('category_slug = ?');
      params.push(String(category).trim());
    }
    if (featured === 'true') {
      clauses.push('is_featured = 1');
    }
    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      clauses.push('(name LIKE ? OR description LIKE ? OR category_slug LIKE ? OR tag LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = SORT_MAP[sort] || SORT_MAP.featured;

    const rows = await query(`SELECT * FROM products ${whereSql} ORDER BY ${orderBy}`, params);
    res.json({ products: rows.map(serializeProduct) });
  })
);

/**
 * GET /api/products/:idOrSlug — Product detail + approved reviews.
 */
router.get(
  '/products/:idOrSlug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const key = String(req.params.idOrSlug).trim();
    const isNumeric = /^\d+$/.test(key);
    const productRow = isNumeric
      ? await queryOne('SELECT * FROM products WHERE id = ? OR slug = ?', [Number(key), key])
      : await queryOne('SELECT * FROM products WHERE slug = ?', [key]);

    if (!productRow || (!productRow.is_active && req.user?.role !== 'admin')) {
      throw new AppError('Product creation not found.', 404);
    }

    const reviews = await query(
      `SELECT id, author_name AS authorName, rating, title, comment, created_at AS createdAt
       FROM product_reviews
       WHERE product_id = ? AND is_approved = 1
       ORDER BY id DESC`,
      [productRow.id]
    );

    res.json({
      product: serializeProduct(productRow),
      reviews: reviews.map((r) => ({ ...r, id: Number(r.id), rating: Number(r.rating) }))
    });
  })
);

/**
 * POST /api/products/:idOrSlug/reviews — Submit a customer review for a product.
 */
router.post(
  '/products/:idOrSlug/reviews',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const key = String(req.params.idOrSlug).trim();
    const productRow = /^\d+$/.test(key)
      ? await queryOne('SELECT * FROM products WHERE id = ? OR slug = ?', [Number(key), key])
      : await queryOne('SELECT * FROM products WHERE slug = ?', [key]);

    if (!productRow) {
      throw new AppError('Product not found.', 404);
    }

    const { authorName, rating, title = '', comment } = req.body;
    const cleanName = (authorName || req.user?.name || '').trim();
    const numericRating = Number(rating);

    if (!cleanName || !comment?.trim()) {
      throw new AppError('Your name and review message are required.', 400);
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars.', 400);
    }

    const insertRes = await execute(
      `INSERT INTO product_reviews (product_id, user_id, author_name, rating, title, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [productRow.id, req.user?.id || null, cleanName, numericRating, title.trim(), comment.trim()]
    );

    await recalculateProductRating(productRow.id);
    const created = await queryOne(
      'SELECT id, author_name AS authorName, rating, title, comment, created_at AS createdAt FROM product_reviews WHERE id = ?',
      [insertRes.insertId]
    );
    const updatedProduct = await queryOne('SELECT rating, review_count FROM products WHERE id = ?', [
      productRow.id
    ]);

    res.status(201).json({
      review: { ...created, id: Number(created.id), rating: Number(created.rating) },
      rating: Number(updatedProduct.rating),
      reviewCount: Number(updatedProduct.review_count)
    });
  })
);

/**
 * POST /api/admin/products — Create a new jewellery creation.
 */
router.post(
  '/admin/products',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      name,
      slug,
      category,
      price,
      originalPrice = null,
      badge = '',
      tag = '',
      description,
      story = '',
      materials = [],
      sizes = [],
      images = [],
      stockQty = 20,
      isFeatured = false,
      isActive = true
    } = req.body;

    if (!name?.trim() || !category?.trim() || !price || !description?.trim()) {
      throw new AppError('Name, category, price, and description are required.', 400);
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      throw new AppError('Product price must be greater than ₹0.', 400);
    }

    const finalSlug = await resolveUniqueSlug(slug || name);
    const cleanMaterials = sanitizeStringList(materials);
    const cleanSizes = sanitizeStringList(sizes);
    const cleanImages = sanitizeStringList(images);

    const resInsert = await execute(
      `INSERT INTO products (
        slug, name, category_slug, price, original_price, badge, tag,
        description, story, materials_json, sizes_json, images_json,
        stock_qty, is_featured, is_active, rating, review_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0)`,
      [
        finalSlug,
        name.trim(),
        category.trim(),
        Math.round(numericPrice),
        originalPrice ? Math.round(Number(originalPrice)) : null,
        badge.trim() || null,
        tag.trim() || null,
        description.trim(),
        story.trim(),
        JSON.stringify(cleanMaterials.length ? cleanMaterials : ['Handmade Crystal & Brass']),
        JSON.stringify(cleanSizes.length ? cleanSizes : ['Standard Fit']),
        JSON.stringify(cleanImages),
        Math.max(0, Number(stockQty ?? 20)),
        isFeatured ? 1 : 0,
        isActive ? 1 : 0
      ]
    );

    const created = await queryOne('SELECT * FROM products WHERE id = ?', [resInsert.insertId]);
    res.status(201).json({ product: serializeProduct(created) });
  })
);

/**
 * PUT /api/admin/products/:id — Edit product details, gallery images, pricing, or stock.
 */
router.put(
  '/admin/products/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const key = String(req.params.id).trim();
    const existing = /^\d+$/.test(key)
      ? await queryOne('SELECT * FROM products WHERE id = ? OR slug = ?', [Number(key), key])
      : await queryOne('SELECT * FROM products WHERE slug = ?', [key]);

    if (!existing) {
      throw new AppError('Product not found.', 404);
    }

    const {
      name,
      category,
      price,
      originalPrice,
      badge,
      tag,
      description,
      story,
      materials,
      sizes,
      images,
      stockQty,
      isFeatured,
      isActive
    } = req.body;

    const nextPrice = price !== undefined ? Math.round(Number(price)) : Number(existing.price);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      throw new AppError('Product price must be greater than ₹0.', 400);
    }

    await execute(
      `UPDATE products SET
        name = ?, category_slug = ?, price = ?, original_price = ?, badge = ?, tag = ?,
        description = ?, story = ?, materials_json = ?, sizes_json = ?, images_json = ?,
        stock_qty = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        (name ?? existing.name).trim(),
        (category ?? existing.category_slug).trim(),
        nextPrice,
        originalPrice === null || originalPrice === ''
          ? null
          : originalPrice !== undefined
            ? Math.round(Number(originalPrice))
            : existing.original_price,
        badge !== undefined ? badge?.trim() || null : existing.badge,
        tag !== undefined ? tag?.trim() || null : existing.tag,
        (description ?? existing.description).trim(),
        story !== undefined ? story.trim() : existing.story || '',
        materials !== undefined ? JSON.stringify(sanitizeStringList(materials)) : existing.materials_json,
        sizes !== undefined ? JSON.stringify(sanitizeStringList(sizes)) : existing.sizes_json,
        images !== undefined ? JSON.stringify(sanitizeStringList(images)) : existing.images_json,
        stockQty !== undefined ? Math.max(0, Number(stockQty)) : existing.stock_qty,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : existing.is_featured,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        existing.id
      ]
    );

    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [existing.id]);
    res.json({ product: serializeProduct(updated) });
  })
);

/**
 * DELETE /api/admin/products/:id — Delete a product permanently.
 */
router.delete(
  '/admin/products/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const key = String(req.params.id).trim();
    const existing = /^\d+$/.test(key)
      ? await queryOne('SELECT id FROM products WHERE id = ? OR slug = ?', [Number(key), key])
      : await queryOne('SELECT id FROM products WHERE slug = ?', [key]);

    if (!existing) {
      throw new AppError('Product not found.', 404);
    }

    await execute('DELETE FROM products WHERE id = ?', [existing.id]);
    res.json({ ok: true });
  })
);

/**
 * GET /api/admin/reviews — List all reviews with product name for moderation.
 */
router.get(
  '/admin/reviews',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query(`
      SELECT r.*, p.name AS product_name, p.slug AS product_slug
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      ORDER BY r.id DESC
    `);
    res.json({
      reviews: rows.map((r) => ({
        id: Number(r.id),
        productId: Number(r.product_id),
        productName: r.product_name,
        productSlug: r.product_slug,
        authorName: r.author_name,
        rating: Number(r.rating),
        title: r.title || '',
        comment: r.comment,
        isApproved: Boolean(r.is_approved),
        createdAt: r.created_at
      }))
    });
  })
);

/**
 * PUT /api/admin/reviews/:id — Toggle approval visibility of a review.
 */
router.put(
  '/admin/reviews/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const reviewId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
    if (!existing) {
      throw new AppError('Review not found.', 404);
    }

    const nextApproved = req.body.isApproved !== undefined ? (req.body.isApproved ? 1 : 0) : existing.is_approved ? 0 : 1;
    await execute('UPDATE product_reviews SET is_approved = ? WHERE id = ?', [nextApproved, reviewId]);
    await recalculateProductRating(existing.product_id);

    res.json({ ok: true, isApproved: Boolean(nextApproved) });
  })
);

/**
 * DELETE /api/admin/reviews/:id — Remove a review permanently.
 */
router.delete(
  '/admin/reviews/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const reviewId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
    if (!existing) {
      throw new AppError('Review not found.', 404);
    }

    await execute('DELETE FROM product_reviews WHERE id = ?', [reviewId]);
    await recalculateProductRating(existing.product_id);
    res.json({ ok: true });
  })
);

export default router;
