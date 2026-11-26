import express from 'express';
import { execute, query, queryOne } from '../config/db.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { generateReferenceCode } from '../utils/slug.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

const ALLOWED_OPTION_GROUPS = new Set([
  'jewellery_type',
  'crystal_element',
  'finish_style',
  'budget_tier'
]);

const ALLOWED_STATUSES = new Set([
  'Pending Review',
  'Quote Sent',
  'Approved & Crafting',
  'Ready to Ship',
  'Completed',
  'Cancelled'
]);

function formatCustomOption(row) {
  return {
    id: Number(row.id),
    optionGroup: row.option_group,
    label: row.label,
    subtitle: row.subtitle || '',
    extraPrice: Number(row.extra_price ?? 0),
    swatchColor: row.swatch_color || null,
    imageUrl: row.image_url || '',
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active)
  };
}

function formatCustomOrder(row) {
  return {
    id: Number(row.id),
    requestCode: row.request_code,
    userId: row.user_id ? Number(row.user_id) : null,
    customerName: row.customer_name,
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone,
    jewelryType: row.jewelry_type,
    crystal: row.crystal,
    budget: row.budget,
    finishStyle: row.finish_style || '',
    wristSize: row.wrist_size || '',
    engravingText: row.engraving_text || '',
    notes: row.notes || '',
    referenceImageUrl: row.reference_image_url || '',
    estimatedPrice: row.estimated_price ? Number(row.estimated_price) : null,
    quotedPrice: row.quoted_price ? Number(row.quoted_price) : null,
    adminReply: row.admin_reply || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * GET /api/custom-orders/config — Public dynamic options powering Custom Order Builder.
 */
router.get(
  '/custom-orders/config',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      'SELECT * FROM custom_order_options WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const mapped = rows.map(formatCustomOption);
    res.json({
      jewelleryTypes: mapped.filter((o) => o.optionGroup === 'jewellery_type'),
      crystals: mapped.filter((o) => o.optionGroup === 'crystal_element'),
      finishes: mapped.filter((o) => o.optionGroup === 'finish_style'),
      budgets: mapped.filter((o) => o.optionGroup === 'budget_tier')
    });
  })
);

/**
 * POST /api/custom-orders — Submit a bespoke jewellery commission request.
 */
router.post(
  '/custom-orders',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      customerName,
      customerEmail = '',
      customerPhone,
      jewelryType,
      crystal,
      budget,
      finishStyle = '',
      wristSize = '',
      engravingText = '',
      notes = '',
      referenceImageUrl = ''
    } = req.body;

    const cleanName = (customerName || req.user?.name || '').trim();
    const cleanEmail = (customerEmail || req.user?.email || '').trim().toLowerCase();
    const cleanPhone = (customerPhone || req.user?.phone || '').trim();

    if (!cleanName || !cleanPhone || !jewelryType?.trim() || !crystal?.trim() || !budget?.trim()) {
      throw new AppError(
        'Please enter your name, WhatsApp/phone number, and select jewellery type, crystal, and budget.',
        400
      );
    }

    // Calculate transparent starting estimate from studio option prices
    const activeOpts = await query('SELECT label, option_group, extra_price FROM custom_order_options WHERE is_active = 1');
    const findPrice = (group, label) =>
      Number(activeOpts.find((o) => o.option_group === group && o.label === label)?.extra_price || 0);

    const estimatedPrice =
      findPrice('jewellery_type', jewelryType.trim()) +
      findPrice('crystal_element', crystal.trim()) +
      (finishStyle ? findPrice('finish_style', finishStyle.trim()) : 0);

    const requestCode = generateReferenceCode('BESPOKE');

    const resInsert = await execute(
      `INSERT INTO custom_orders (
        request_code, user_id, customer_name, customer_email, customer_phone,
        jewelry_type, crystal, budget, finish_style, wrist_size, engraving_text,
        notes, reference_image_url, estimated_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')`,
      [
        requestCode,
        req.user?.id || null,
        cleanName,
        cleanEmail,
        cleanPhone,
        jewelryType.trim(),
        crystal.trim(),
        budget.trim(),
        finishStyle.trim(),
        wristSize.trim(),
        engravingText.trim(),
        notes.trim(),
        referenceImageUrl.trim(),
        estimatedPrice > 0 ? estimatedPrice : null
      ]
    );

    const created = await queryOne('SELECT * FROM custom_orders WHERE id = ?', [resInsert.insertId]);

    // Notify studio owner (non-blocking best-effort)
    const studioEmailRow = await queryOne("SELECT setting_value FROM site_settings WHERE setting_key = 'support_email'");
    const studioTo = studioEmailRow?.setting_value || process.env.ADMIN_EMAIL;
    if (studioTo) {
      sendEmail({
        to: studioTo,
        subject: `✨ New Custom Jewellery Request (${requestCode}) — ${cleanName}`,
        html: `<h3>New Bespoke Request: ${requestCode}</h3>
          <p><strong>Customer:</strong> ${cleanName} (${cleanPhone}${cleanEmail ? `, ${cleanEmail}` : ''})</p>
          <p><strong>Piece:</strong> ${jewelryType} • ${crystal} • ${finishStyle || 'Standard'}</p>
          <p><strong>Budget:</strong> ${budget} | <strong>Est. Base:</strong> ₹${estimatedPrice}</p>
          <p><strong>Notes:</strong> ${notes || '—'}</p>`
      }).catch(() => {});
    }

    res.status(201).json({ customOrder: formatCustomOrder(created) });
  })
);

/**
 * GET /api/custom-orders/my — Signed-in customer's own bespoke commissions.
 */
router.get(
  '/custom-orders/my',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT * FROM custom_orders
       WHERE user_id = ? OR (customer_email != '' AND LOWER(customer_email) = ?)
       ORDER BY id DESC`,
      [req.user.id, req.user.email.toLowerCase()]
    );
    res.json({ customOrders: rows.map(formatCustomOrder) });
  })
);

/**
 * GET /api/custom-orders/track/:code — Look up bespoke commission quote & status by code.
 */
router.get(
  '/custom-orders/track/:code',
  asyncHandler(async (req, res) => {
    const code = String(req.params.code).trim().toUpperCase();
    const row = await queryOne('SELECT * FROM custom_orders WHERE request_code = ?', [code]);
    if (!row) {
      throw new AppError(`No bespoke request found for code ${code}.`, 404);
    }
    res.json({ customOrder: formatCustomOrder(row) });
  })
);

// =========================================================================
// ADMIN ENDPOINTS — CUSTOM ORDER REQUESTS & STUDIO OPTION BUILDER
// =========================================================================

/**
 * GET /api/admin/custom-orders — All bespoke requests with optional status filter.
 */
router.get(
  '/admin/custom-orders',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const rows = status && status !== 'All'
      ? await query('SELECT * FROM custom_orders WHERE status = ? ORDER BY id DESC', [status])
      : await query('SELECT * FROM custom_orders ORDER BY id DESC');

    res.json({ customOrders: rows.map(formatCustomOrder) });
  })
);

/**
 * PUT /api/admin/custom-orders/:id — Set studio price quote, note, and update bespoke status.
 */
router.put(
  '/admin/custom-orders/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM custom_orders WHERE id = ?', [id]);
    if (!existing) {
      throw new AppError('Custom order request not found.', 404);
    }

    const { status, quotedPrice, adminReply } = req.body;
    if (status && !ALLOWED_STATUSES.has(status)) {
      throw new AppError('Invalid custom order status.', 400);
    }

    const nextStatus = status || existing.status;
    const nextQuote =
      quotedPrice === null || quotedPrice === ''
        ? null
        : quotedPrice !== undefined
          ? Math.round(Number(quotedPrice))
          : existing.quoted_price;

    await execute(
      `UPDATE custom_orders
       SET status = ?, quoted_price = ?, admin_reply = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextStatus,
        nextQuote,
        adminReply !== undefined ? String(adminReply).trim() : existing.admin_reply || '',
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM custom_orders WHERE id = ?', [id]);

    // Email customer when studio updates quote or status
    if (updated.customer_email) {
      sendEmail({
        to: updated.customer_email,
        subject: `Update on your Custom Piece (${updated.request_code}): ${updated.status}`,
        html: `<p>Hi ${updated.customer_name},</p>
          <p>Your bespoke commission <strong>${updated.request_code}</strong> (${updated.jewelry_type} • ${updated.crystal}) status is now: <strong>${updated.status}</strong>.</p>
          ${updated.quoted_price ? `<p><strong>Studio Quote:</strong> ₹${Number(updated.quoted_price).toLocaleString('en-IN')}</p>` : ''}
          ${updated.admin_reply ? `<p><strong>Note from Studio:</strong> ${updated.admin_reply}</p>` : ''}`
      }).catch(() => {});
    }

    res.json({ customOrder: formatCustomOrder(updated) });
  })
);

/**
 * GET /api/admin/custom-options — All options (active & hidden) for Admin Custom Studio UI.
 */
router.get(
  '/admin/custom-options',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM custom_order_options ORDER BY option_group ASC, sort_order ASC, id ASC');
    res.json({ options: rows.map(formatCustomOption) });
  })
);

/**
 * POST /api/admin/custom-options — Add a new jewellery type, crystal, finish, or budget tier.
 */
router.post(
  '/admin/custom-options',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      optionGroup,
      label,
      subtitle = '',
      extraPrice = 0,
      swatchColor = '',
      imageUrl = '',
      sortOrder = 0,
      isActive = true
    } = req.body;

    if (!ALLOWED_OPTION_GROUPS.has(optionGroup)) {
      throw new AppError('Invalid option group.', 400);
    }
    if (!label?.trim()) {
      throw new AppError('Option label is required.', 400);
    }

    const resInsert = await execute(
      `INSERT INTO custom_order_options (
        option_group, label, subtitle, extra_price, swatch_color, image_url, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        optionGroup,
        label.trim(),
        subtitle.trim(),
        Math.max(0, Math.round(Number(extraPrice || 0))),
        swatchColor.trim() || null,
        imageUrl.trim() || null,
        Number(sortOrder || 0),
        isActive ? 1 : 0
      ]
    );

    const created = await queryOne('SELECT * FROM custom_order_options WHERE id = ?', [resInsert.insertId]);
    res.status(201).json({ option: formatCustomOption(created) });
  })
);

/**
 * PUT /api/admin/custom-options/:id — Edit or toggle an existing Custom Builder option.
 */
router.put(
  '/admin/custom-options/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const optId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM custom_order_options WHERE id = ?', [optId]);
    if (!existing) {
      throw new AppError('Custom option not found.', 404);
    }

    const { label, subtitle, extraPrice, swatchColor, imageUrl, sortOrder, isActive } = req.body;
    await execute(
      `UPDATE custom_order_options
       SET label = ?, subtitle = ?, extra_price = ?, swatch_color = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        (label ?? existing.label).trim(),
        subtitle !== undefined ? subtitle.trim() : existing.subtitle || '',
        extraPrice !== undefined ? Math.max(0, Math.round(Number(extraPrice))) : existing.extra_price,
        swatchColor !== undefined ? swatchColor?.trim() || null : existing.swatch_color,
        imageUrl !== undefined ? imageUrl?.trim() || null : existing.image_url,
        sortOrder !== undefined ? Number(sortOrder) : existing.sort_order,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        optId
      ]
    );

    const updated = await queryOne('SELECT * FROM custom_order_options WHERE id = ?', [optId]);
    res.json({ option: formatCustomOption(updated) });
  })
);

/**
 * DELETE /api/admin/custom-options/:id — Remove a Custom Builder option.
 */
router.delete(
  '/admin/custom-options/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const optId = Number(req.params.id);
    const del = await execute('DELETE FROM custom_order_options WHERE id = ?', [optId]);
    if (!del.affectedRows) {
      throw new AppError('Custom option not found.', 404);
    }
    res.json({ ok: true });
  })
);

export default router;
