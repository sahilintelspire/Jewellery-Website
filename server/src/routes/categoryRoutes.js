import express from 'express';
import { execute, query, queryOne } from '../config/db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slug.js';

const router = express.Router();

function formatCategory(row) {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    imageUrl: row.image_url || '',
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
    productCount: row.product_count !== undefined ? Number(row.product_count) : undefined
  };
}

/**
 * GET /api/categories — Public active categories with active product counts.
 */
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = await query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_slug = c.slug AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    res.json({ categories: rows.map(formatCategory) });
  })
);

/**
 * GET /api/admin/categories — List all categories (including inactive) for Admin UI.
 */
router.get(
  '/admin/categories',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_slug = c.slug
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    res.json({ categories: rows.map(formatCategory) });
  })
);

/**
 * POST /api/admin/categories — Add a new storefront category.
 */
router.post(
  '/admin/categories',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, slug, description = '', imageUrl = '', sortOrder = 0, isActive = true } = req.body;
    if (!name?.trim()) {
      throw new AppError('Category name is required.', 400);
    }

    const finalSlug = slugify(slug || name);
    if (!finalSlug || finalSlug === 'all') {
      throw new AppError('Please choose a valid unique category slug.', 400);
    }

    const exists = await queryOne('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
    if (exists) {
      throw new AppError(`Category with slug "${finalSlug}" already exists.`, 409);
    }

    const result = await execute(
      `INSERT INTO categories (slug, name, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [finalSlug, name.trim(), description.trim(), imageUrl.trim(), Number(sortOrder || 0), isActive ? 1 : 0]
    );

    const created = await queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ category: formatCategory(created) });
  })
);

/**
 * PUT /api/admin/categories/:id — Edit category title, visibility, or sort order.
 */
router.put(
  '/admin/categories/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const catId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM categories WHERE id = ?', [catId]);
    if (!existing) {
      throw new AppError('Category not found.', 404);
    }

    const { name, description, imageUrl, sortOrder, isActive } = req.body;
    await execute(
      `UPDATE categories
       SET name = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        (name ?? existing.name).trim(),
        description !== undefined ? description.trim() : existing.description || '',
        imageUrl !== undefined ? imageUrl.trim() : existing.image_url || '',
        sortOrder !== undefined ? Number(sortOrder) : existing.sort_order,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        catId
      ]
    );

    const updated = await queryOne('SELECT * FROM categories WHERE id = ?', [catId]);
    res.json({ category: formatCategory(updated) });
  })
);

/**
 * DELETE /api/admin/categories/:id — Remove category if no products remain assigned.
 */
router.delete(
  '/admin/categories/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const catId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM categories WHERE id = ?', [catId]);
    if (!existing) {
      throw new AppError('Category not found.', 404);
    }

    const linked = await queryOne('SELECT COUNT(*) AS cnt FROM products WHERE category_slug = ?', [
      existing.slug
    ]);
    if (Number(linked?.cnt || 0) > 0) {
      throw new AppError(
        `Cannot delete "${existing.name}" while ${linked.cnt} products belong to it. Reassign or hide the category instead.`,
        409
      );
    }

    await execute('DELETE FROM categories WHERE id = ?', [catId]);
    res.json({ ok: true });
  })
);

export default router;
