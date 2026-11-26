import express from 'express';
import { execute, query, queryOne, withTransaction } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(requireAuth);

function mapAddress(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    phone: row.phone,
    pincode: row.pincode,
    line1: row.line1,
    line2: row.line2 || '',
    houseNo: row.line1,
    area: row.line2 || '',
    city: row.city,
    state: row.state,
    type: row.address_type || 'Home',
    isDefault: Boolean(row.is_default)
  };
}

/**
 * GET /api/addresses — List signed-in user's saved addresses.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.user.id]
    );
    res.json({ addresses: rows.map(mapAddress) });
  })
);

/**
 * POST /api/addresses — Save a new delivery address.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      fullName,
      phone,
      pincode,
      line1,
      houseNo,
      line2,
      area,
      landmark = '',
      city,
      state,
      type = 'Home',
      isDefault = false
    } = req.body;

    const resolvedLine1 = (line1 || houseNo || '').trim();
    const resolvedLine2 = (line2 !== undefined ? line2 : [area, landmark].filter(Boolean).join(', ')).trim();

    if (!fullName?.trim() || !phone?.trim() || !pincode?.trim() || !resolvedLine1 || !city?.trim() || !state?.trim()) {
      throw new AppError('Please complete all required address fields.', 400);
    }

    const created = await withTransaction(async (tx) => {
      const existingCount = await tx.queryOne(
        'SELECT COUNT(*) AS cnt FROM addresses WHERE user_id = ?',
        [req.user.id]
      );
      const makeDefault = isDefault || Number(existingCount?.cnt || 0) === 0 ? 1 : 0;

      if (makeDefault) {
        await tx.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      const resInsert = await tx.execute(
        `INSERT INTO addresses (user_id, full_name, phone, pincode, line1, line2, city, state, address_type, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          fullName.trim(),
          phone.trim(),
          pincode.trim(),
          resolvedLine1,
          resolvedLine2,
          city.trim(),
          state.trim(),
          type.trim() || 'Home',
          makeDefault
        ]
      );

      return tx.queryOne('SELECT * FROM addresses WHERE id = ?', [resInsert.insertId]);
    });

    res.status(201).json({ address: mapAddress(created) });
  })
);

/**
 * PUT /api/addresses/:id — Edit an existing saved address.
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const addrId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
      addrId,
      req.user.id
    ]);
    if (!existing) {
      throw new AppError('Address not found.', 404);
    }

    const { fullName, phone, pincode, line1, houseNo, line2, area, landmark, city, state, type, isDefault } = req.body;
    const resolvedLine1 = (line1 ?? houseNo ?? existing.line1).trim();
    const resolvedLine2 =
      line2 !== undefined
        ? line2.trim()
        : area !== undefined
          ? [area, landmark].filter(Boolean).join(', ').trim()
          : existing.line2 || '';

    const updated = await withTransaction(async (tx) => {
      if (isDefault) {
        await tx.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      await tx.execute(
        `UPDATE addresses
         SET full_name = ?, phone = ?, pincode = ?, line1 = ?, line2 = ?, city = ?, state = ?, address_type = ?, is_default = ?
         WHERE id = ? AND user_id = ?`,
        [
          (fullName ?? existing.full_name).trim(),
          (phone ?? existing.phone).trim(),
          (pincode ?? existing.pincode).trim(),
          resolvedLine1,
          resolvedLine2,
          (city ?? existing.city).trim(),
          (state ?? existing.state).trim(),
          (type ?? existing.address_type).trim(),
          isDefault !== undefined ? (isDefault ? 1 : 0) : existing.is_default,
          addrId,
          req.user.id
        ]
      );

      return tx.queryOne('SELECT * FROM addresses WHERE id = ?', [addrId]);
    });

    res.json({ address: mapAddress(updated) });
  })
);

/**
 * DELETE /api/addresses/:id — Remove an address.
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const addrId = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
      addrId,
      req.user.id
    ]);
    if (!existing) {
      throw new AppError('Address not found.', 404);
    }

    await execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addrId, req.user.id]);

    if (existing.is_default) {
      const nextDefault = await queryOne(
        'SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [req.user.id]
      );
      if (nextDefault) {
        await execute('UPDATE addresses SET is_default = 1 WHERE id = ?', [nextDefault.id]);
      }
    }

    res.json({ ok: true });
  })
);

export default router;
