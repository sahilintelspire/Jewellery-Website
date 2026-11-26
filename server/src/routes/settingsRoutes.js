import express from 'express';
import { execute, query, queryOne, upsertSiteSetting } from '../config/db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { formatSettingsMap } from '../utils/json.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

function formatCoupon(row) {
  return {
    id: Number(row.id),
    code: row.code,
    description: row.description || '',
    discountType: row.discount_type,
    discountValue: Number(row.discount_value || 0),
    minOrder: Number(row.min_order || 0),
    maxDiscount: row.max_discount ? Number(row.max_discount) : null,
    usageLimit: row.usage_limit ? Number(row.usage_limit) : null,
    usedCount: Number(row.used_count || 0),
    isActive: Boolean(row.is_active),
    expiresAt: row.expires_at || null
  };
}

/**
 * Compute discount & shipping effect for an active coupon row.
 */
export function evaluateCoupon(couponRow, subtotal, shippingFee) {
  if (!couponRow || !couponRow.is_active) {
    throw new AppError('Promo code is invalid or inactive.', 400);
  }
  if (couponRow.expires_at && Date.now() > new Date(couponRow.expires_at).getTime()) {
    throw new AppError('This promo code has expired.', 400);
  }
  if (couponRow.usage_limit && Number(couponRow.used_count) >= Number(couponRow.usage_limit)) {
    throw new AppError('This promo code has reached its redemption limit.', 400);
  }
  const minOrder = Number(couponRow.min_order || 0);
  if (subtotal < minOrder) {
    throw new AppError(`Minimum subtotal of ₹${minOrder.toLocaleString('en-IN')} required for ${couponRow.code}.`, 400);
  }

  let discountAmount = 0;
  let waivesShipping = false;

  if (couponRow.discount_type === 'percent') {
    discountAmount = Math.round((subtotal * Number(couponRow.discount_value)) / 100);
    if (couponRow.max_discount) {
      discountAmount = Math.min(discountAmount, Number(couponRow.max_discount));
    }
  } else if (couponRow.discount_type === 'flat') {
    discountAmount = Math.min(subtotal, Number(couponRow.discount_value));
  } else if (couponRow.discount_type === 'freeship') {
    waivesShipping = true;
    discountAmount = 0;
  }

  return {
    coupon: formatCoupon(couponRow),
    discountAmount,
    waivesShipping,
    effectiveShippingFee: waivesShipping ? 0 : shippingFee
  };
}

/**
 * GET /api/settings — Public storefront settings & integration flags.
 */
router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = formatSettingsMap(rows);
    res.json({
      settings,
      integrations: {
        razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        googleClientId: process.env.GOOGLE_CLIENT_ID || null
      }
    });
  })
);

/**
 * PUT /api/admin/settings — Bulk update storefront CMS settings.
 */
router.put(
  '/admin/settings',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updates = req.body?.settings || req.body;
    if (!updates || typeof updates !== 'object') {
      throw new AppError('Invalid settings payload.', 400);
    }

    for (const [key, val] of Object.entries(updates)) {
      if (typeof key === 'string' && key.trim()) {
        await upsertSiteSetting(key.trim(), typeof val === 'boolean' ? String(val) : String(val ?? ''));
      }
    }

    const rows = await query('SELECT setting_key, setting_value FROM site_settings');
    res.json({ settings: formatSettingsMap(rows) });
  })
);

/**
 * GET /api/coupons/validate — Validate promo code against cart subtotal & delivery fee.
 */
router.get(
  '/coupons/validate',
  asyncHandler(async (req, res) => {
    const code = String(req.query.code || '').trim().toUpperCase();
    const subtotal = Math.max(0, Number(req.query.subtotal || 0));
    const shippingFee = Math.max(0, Number(req.query.shippingFee || 0));

    if (!code) {
      throw new AppError('Please enter a promo code.', 400);
    }

    const row = await queryOne('SELECT * FROM coupons WHERE UPPER(code) = ?', [code]);
    const evaluation = evaluateCoupon(row, subtotal, shippingFee);
    res.json(evaluation);
  })
);

/**
 * GET /api/admin/coupons — List all coupons.
 */
router.get(
  '/admin/coupons',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ coupons: rows.map(formatCoupon) });
  })
);

/**
 * POST /api/admin/coupons — Create a promo coupon.
 */
router.post(
  '/admin/coupons',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      code,
      description = '',
      discountType = 'percent',
      discountValue = 0,
      minOrder = 0,
      maxDiscount = null,
      usageLimit = null,
      expiresAt = null,
      isActive = true
    } = req.body;

    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new AppError('Coupon code is required.', 400);
    }
    if (!['percent', 'flat', 'freeship'].includes(discountType)) {
      throw new AppError('Discount type must be percent, flat, or freeship.', 400);
    }

    const existing = await queryOne('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (existing) {
      throw new AppError(`Coupon "${cleanCode}" already exists.`, 409);
    }

    const resInsert = await execute(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_discount, usage_limit, is_active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        description.trim(),
        discountType,
        Math.max(0, Number(discountValue || 0)),
        Math.max(0, Number(minOrder || 0)),
        maxDiscount ? Number(maxDiscount) : null,
        usageLimit ? Number(usageLimit) : null,
        isActive ? 1 : 0,
        expiresAt || null
      ]
    );

    const created = await queryOne('SELECT * FROM coupons WHERE id = ?', [resInsert.insertId]);
    res.status(201).json({ coupon: formatCoupon(created) });
  })
);

/**
 * PUT /api/admin/coupons/:id — Edit or toggle a coupon.
 */
router.put(
  '/admin/coupons/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM coupons WHERE id = ?', [id]);
    if (!existing) {
      throw new AppError('Coupon not found.', 404);
    }

    const { description, discountType, discountValue, minOrder, maxDiscount, usageLimit, isActive, expiresAt } =
      req.body;

    await execute(
      `UPDATE coupons
       SET description = ?, discount_type = ?, discount_value = ?, min_order = ?, max_discount = ?, usage_limit = ?, is_active = ?, expires_at = ?
       WHERE id = ?`,
      [
        description !== undefined ? description.trim() : existing.description,
        discountType ?? existing.discount_type,
        discountValue !== undefined ? Math.max(0, Number(discountValue)) : existing.discount_value,
        minOrder !== undefined ? Math.max(0, Number(minOrder)) : existing.min_order,
        maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : existing.max_discount,
        usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : existing.usage_limit,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        expiresAt !== undefined ? expiresAt || null : existing.expires_at,
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM coupons WHERE id = ?', [id]);
    res.json({ coupon: formatCoupon(updated) });
  })
);

/**
 * DELETE /api/admin/coupons/:id — Delete a coupon.
 */
router.delete(
  '/admin/coupons/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const del = await execute('DELETE FROM coupons WHERE id = ?', [id]);
    if (!del.affectedRows) {
      throw new AppError('Coupon not found.', 404);
    }
    res.json({ ok: true });
  })
);

/**
 * POST /api/subscribers — Subscribe email to studio drop alerts.
 */
router.post(
  '/subscribers',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const source = String(req.body.source || 'newsletter').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Please enter a valid email address.', 400);
    }

    const existing = await queryOne('SELECT id FROM subscribers WHERE email = ?', [email]);
    if (existing) {
      await execute('UPDATE subscribers SET is_active = 1 WHERE id = ?', [existing.id]);
      return res.json({ ok: true, alreadySubscribed: true, message: 'You are already on our Private Drop List ✨' });
    }

    await execute('INSERT INTO subscribers (email, source, is_active) VALUES (?, ?, 1)', [email, source]);
    res.status(201).json({ ok: true, message: 'Welcome to the Inner Circle! Early drop access unlocked ✨' });
  })
);

/**
 * GET /api/admin/subscribers — View all newsletter subscribers.
 */
router.get(
  '/admin/subscribers',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM subscribers ORDER BY id DESC');
    res.json({
      subscribers: rows.map((s) => ({
        id: Number(s.id),
        email: s.email,
        source: s.source,
        isActive: Boolean(s.is_active),
        createdAt: s.created_at
      }))
    });
  })
);

/**
 * POST /api/admin/subscribers/broadcast — Send a New Drop / Announcement email to active subscribers.
 */
router.post(
  '/admin/subscribers/broadcast',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      throw new AppError('Email subject and announcement message are required.', 400);
    }

    const subs = await query('SELECT email FROM subscribers WHERE is_active = 1');
    if (subs.length === 0) {
      throw new AppError('There are no active subscribers yet.', 400);
    }

    let previewCount = 0;
    let sentCount = 0;
    for (const s of subs) {
      const r = await sendEmail({
        to: s.email,
        subject: subject.trim(),
        html: `<div style="font-family:Georgia,serif;color:#2C2724;max-width:560px;">
          <h2 style="color:#8E6C27;">AURA JEWELS Studio ✨</h2>
          <p style="white-space:pre-line;line-height:1.6;">${message.trim()}</p>
          <hr style="border:none;border-top:1px solid #E5DFD6;margin:20px 0;"/>
          <p style="font-size:12px;color:#6E6259;">Handcrafted Jewellery Atelier • India</p>
        </div>`
      });
      if (r.sent) sentCount += 1;
      if (r.previewMode) previewCount += 1;
    }

    res.json({
      ok: true,
      recipientCount: subs.length,
      sentCount,
      previewCount
    });
  })
);

/**
 * POST /api/contact — Save customer inquiry from Contact Us page.
 */
router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const { name, email, phone = '', subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      throw new AppError('Please fill in your name, email, subject, and message.', 400);
    }

    const resInsert = await execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'New')`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), subject.trim(), message.trim()]
    );

    const created = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [resInsert.insertId]);
    res.status(201).json({ inquiry: { ...created, id: Number(created.id) } });
  })
);

/**
 * GET /api/admin/inquiries — View customer contact form inquiries.
 */
router.get(
  '/admin/inquiries',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM contact_messages ORDER BY id DESC');
    res.json({
      inquiries: rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        subject: r.subject,
        message: r.message,
        status: r.status,
        adminNote: r.admin_note || '',
        createdAt: r.created_at
      }))
    });
  })
);

/**
 * PUT /api/admin/inquiries/:id — Mark contact inquiry as Replied/Resolved with internal note.
 */
router.put(
  '/admin/inquiries/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
    if (!existing) {
      throw new AppError('Inquiry not found.', 404);
    }

    const { status, adminNote } = req.body;
    await execute('UPDATE contact_messages SET status = ?, admin_note = ? WHERE id = ?', [
      status || existing.status,
      adminNote !== undefined ? adminNote.trim() : existing.admin_note || '',
      id
    ]);

    const updated = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
    res.json({ inquiry: { ...updated, id: Number(updated.id) } });
  })
);

export default router;
