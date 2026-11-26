import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { execute, query, queryOne, withTransaction } from '../config/db.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { formatSettingsMap, safeParseJson } from '../utils/json.js';
import { generateReferenceCode } from '../utils/slug.js';
import { evaluateCoupon } from './settingsRoutes.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

export const ORDER_STAGES = [
  'Order Placed',
  'Crafting in Studio',
  'Quality & Polish',
  'Dispatched',
  'Delivered',
  'Cancelled'
];

const PAYMENT_STATUSES = new Set(['pending', 'paid', 'demo_paid', 'failed', 'refunded']);

function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function formatOrder(row, itemRows = []) {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    userId: row.user_id ? Number(row.user_id) : null,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: safeParseJson(row.shipping_address_json, {}),
    giftNote: row.gift_note || '',
    velvetBoxUpgraded: Boolean(row.velvet_box_upgraded),
    deliveryMethod: row.delivery_method || 'standard',
    couponCode: row.coupon_code || null,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount || 0),
    shippingFee: Number(row.shipping_fee || 0),
    giftWrapFee: Number(row.gift_wrap_fee || 0),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    razorpayOrderId: row.razorpay_order_id || null,
    razorpayPaymentId: row.razorpay_payment_id || null,
    status: row.order_status,
    orderStatus: row.order_status,
    courierName: row.courier_name || '',
    trackingNumber: row.tracking_number || '',
    trackingUrl: row.tracking_url || '',
    adminNotes: row.admin_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: itemRows.map((item) => ({
      id: Number(item.id),
      productId: item.product_id ? Number(item.product_id) : null,
      productSlug: item.product_slug || '',
      name: item.product_name,
      image: item.product_image || '',
      selectedSize: item.selected_size || 'Standard Fit',
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      lineTotal: Number(item.line_total)
    }))
  };
}

async function attachOrderItems(orderRows) {
  if (!orderRows.length) return [];
  const ids = orderRows.map((o) => Number(o.id));
  const placeholders = ids.map(() => '?').join(',');
  const allItems = await query(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`, ids);

  const grouped = new Map();
  for (const item of allItems) {
    const key = Number(item.order_id);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }
  return orderRows.map((o) => formatOrder(o, grouped.get(Number(o.id)) || []));
}

/**
 * Authoritative server-side cart valuation & coupon/shipping breakdown.
 */
async function calculateOrderTotals({
  items,
  couponCode = '',
  deliveryMethod = 'standard',
  velvetBoxUpgraded = false,
  reader = { query, queryOne }
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Your Treasure Bag is empty.', 400);
  }

  const settingRows = await reader.query('SELECT setting_key, setting_value FROM site_settings');
  const settings = formatSettingsMap(settingRows);

  const lineItems = [];
  let subtotal = 0;

  for (const rawItem of items) {
    const qty = Math.max(1, Math.min(25, Math.floor(Number(rawItem.quantity || 1))));
    const itemKey = String(rawItem.id ?? rawItem.slug ?? rawItem.productId ?? '').trim();
    if (!itemKey) {
      throw new AppError('Invalid item in bag.', 400);
    }

    const isNumeric = /^\d+$/.test(itemKey);
    const product = isNumeric
      ? await reader.queryOne('SELECT * FROM products WHERE (id = ? OR slug = ?) AND is_active = 1', [
          Number(itemKey),
          itemKey
        ])
      : await reader.queryOne('SELECT * FROM products WHERE slug = ? AND is_active = 1', [itemKey]);

    if (!product) {
      throw new AppError(`Item "${rawItem.name || itemKey}" is no longer available.`, 400);
    }
    if (Number(product.stock_qty) < qty) {
      throw new AppError(`Only ${product.stock_qty} left in stock for "${product.name}".`, 400);
    }

    const images = safeParseJson(product.images_json, []);
    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    lineItems.push({
      productId: Number(product.id),
      productSlug: product.slug,
      name: product.name,
      image: images[0] || rawItem.image || '',
      selectedSize: String(rawItem.selectedSize || 'Standard Fit').trim(),
      unitPrice,
      quantity: qty,
      lineTotal
    });
  }

  const cleanDelivery = deliveryMethod === 'express' ? 'express' : 'standard';
  const baseShipping =
    cleanDelivery === 'express'
      ? settings.express_shipping_fee
      : subtotal >= settings.free_shipping_threshold
        ? 0
        : settings.standard_shipping_fee;

  let discountAmount = 0;
  let shippingFee = baseShipping;
  let appliedCoupon = null;

  if (couponCode && String(couponCode).trim()) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    const couponRow = await reader.queryOne('SELECT * FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    const evalRes = evaluateCoupon(couponRow, subtotal, baseShipping);
    discountAmount = evalRes.discountAmount;
    shippingFee = evalRes.effectiveShippingFee;
    appliedCoupon = evalRes.coupon;
  }

  const freeGiftUnlocked = subtotal >= settings.free_gift_threshold;
  const giftWrapFee = velvetBoxUpgraded && !freeGiftUnlocked ? settings.velvet_box_upgrade_fee : 0;
  const totalAmount = Math.max(1, subtotal - discountAmount + shippingFee + giftWrapFee);

  return {
    lineItems,
    subtotal,
    discountAmount,
    shippingFee,
    giftWrapFee,
    totalAmount,
    freeGiftUnlocked,
    appliedCoupon,
    settings
  };
}

/**
 * POST /api/orders/preview — Compute exact server totals before payment.
 */
router.post(
  '/orders/preview',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { items, couponCode, deliveryMethod, velvetBoxUpgraded } = req.body;
    const summary = await calculateOrderTotals({
      items,
      couponCode,
      deliveryMethod,
      velvetBoxUpgraded: Boolean(velvetBoxUpgraded)
    });
    res.json({
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      shippingFee: summary.shippingFee,
      giftWrapFee: summary.giftWrapFee,
      totalAmount: summary.totalAmount,
      freeGiftUnlocked: summary.freeGiftUnlocked,
      appliedCoupon: summary.appliedCoupon
    });
  })
);

/**
 * POST /api/payments/razorpay/order — Create Razorpay Order ID (or structured demo order when keys blank).
 */
router.post(
  '/payments/razorpay/order',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { items, couponCode, deliveryMethod, velvetBoxUpgraded } = req.body;
    const totals = await calculateOrderTotals({
      items,
      couponCode,
      deliveryMethod,
      velvetBoxUpgraded: Boolean(velvetBoxUpgraded)
    });

    if (!totals.settings.razorpay_enabled) {
      throw new AppError('Online payment is temporarily disabled. Please choose Cash on Delivery.', 400);
    }

    const amountPaise = Math.round(totals.totalAmount * 100);
    const receipt = generateReferenceCode('RCPT');

    if (!isRazorpayConfigured()) {
      return res.json({
        mode: 'demo',
        keyId: null,
        razorpayOrderId: `order_demo_${Date.now()}`,
        amount: amountPaise,
        currency: 'INR',
        receipt,
        summary: {
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          shippingFee: totals.shippingFee,
          giftWrapFee: totals.giftWrapFee,
          totalAmount: totals.totalAmount
        }
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt
    });

    res.json({
      mode: 'live',
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      summary: {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingFee: totals.shippingFee,
        giftWrapFee: totals.giftWrapFee,
        totalAmount: totals.totalAmount
      }
    });
  })
);

/**
 * POST /api/orders — Place COD order or verify & finalize Razorpay online payment order.
 */
router.post(
  '/orders',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      items,
      shippingAddress,
      giftNote = '',
      velvetBoxUpgraded = false,
      deliveryMethod = 'standard',
      couponCode = '',
      paymentMethod = 'razorpay',
      razorpayOrderId = '',
      razorpayPaymentId = '',
      razorpaySignature = ''
    } = req.body;

    const addrLine1 = (shippingAddress?.line1 || shippingAddress?.houseNo || '').trim();
    const addrLine2 = (shippingAddress?.line2 || shippingAddress?.area || '').trim();

    if (!shippingAddress || !shippingAddress.fullName?.trim() || !shippingAddress.phone?.trim() || !addrLine1 || !shippingAddress.pincode?.trim() || !shippingAddress.city?.trim() || !shippingAddress.state?.trim()) {
      throw new AppError('Complete delivery address is required.', 400);
    }

    const normalizedAddress = {
      ...shippingAddress,
      line1: addrLine1,
      line2: addrLine2,
      houseNo: addrLine1,
      area: addrLine2
    };

    const customerEmail = String(shippingAddress.email || req.user?.email || '').trim().toLowerCase();
    if (!customerEmail) {
      throw new AppError('Customer email is required for order updates and receipt.', 400);
    }

    if (!['razorpay', 'cod'].includes(paymentMethod)) {
      throw new AppError('Payment method must be razorpay or cod.', 400);
    }

    let resolvedPaymentStatus = 'pending';

    if (paymentMethod === 'razorpay') {
      if (isRazorpayConfigured()) {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          throw new AppError('Incomplete Razorpay payment verification details.', 400);
        }
        const expectedHex = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        const expectedBuf = Buffer.from(expectedHex, 'utf8');
        const actualBuf = Buffer.from(String(razorpaySignature), 'utf8');
        if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
          throw new AppError('Razorpay payment signature verification failed.', 400);
        }
        resolvedPaymentStatus = 'paid';
      } else {
        // Explicit demo mode when live Razorpay keys are left empty in .env
        if (!String(razorpayOrderId).startsWith('order_demo_')) {
          throw new AppError('Demo order ID required when Razorpay keys are unset.', 400);
        }
        resolvedPaymentStatus = 'demo_paid';
      }
    }

    const createdOrder = await withTransaction(async (tx) => {
      const totals = await calculateOrderTotals({
        items,
        couponCode,
        deliveryMethod,
        velvetBoxUpgraded: Boolean(velvetBoxUpgraded),
        reader: tx
      });

      if (paymentMethod === 'cod' && !totals.settings.cod_enabled) {
        throw new AppError('Cash on Delivery is currently unavailable.', 400);
      }

      const orderNumber = generateReferenceCode('AURA');
      const resInsert = await tx.execute(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_address_json, gift_note, velvet_box_upgraded, delivery_method, coupon_code,
          subtotal, discount_amount, shipping_fee, gift_wrap_fee, total_amount,
          payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature,
          order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed')`,
        [
          orderNumber,
          req.user?.id || null,
          shippingAddress.fullName.trim(),
          customerEmail,
          shippingAddress.phone.trim(),
          JSON.stringify(normalizedAddress),
          String(giftNote).trim(),
          velvetBoxUpgraded ? 1 : 0,
          deliveryMethod === 'express' ? 'express' : 'standard',
          totals.appliedCoupon?.code || null,
          totals.subtotal,
          totals.discountAmount,
          totals.shippingFee,
          totals.giftWrapFee,
          totals.totalAmount,
          paymentMethod,
          resolvedPaymentStatus,
          razorpayOrderId || null,
          razorpayPaymentId || null,
          razorpaySignature || null
        ]
      );

      for (const item of totals.lineItems) {
        await tx.execute(
          `INSERT INTO order_items (
            order_id, product_id, product_slug, product_name, product_image, selected_size, unit_price, quantity, line_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            resInsert.insertId,
            item.productId,
            item.productSlug,
            item.name,
            item.image,
            item.selectedSize,
            item.unitPrice,
            item.quantity,
            item.lineTotal
          ]
        );

        await tx.execute(
          'UPDATE products SET stock_qty = CASE WHEN stock_qty >= ? THEN stock_qty - ? ELSE 0 END WHERE id = ?',
          [item.quantity, item.quantity, item.productId]
        );
      }

      if (totals.appliedCoupon) {
        await tx.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [
          totals.appliedCoupon.id
        ]);
      }

      const row = await tx.queryOne('SELECT * FROM orders WHERE id = ?', [resInsert.insertId]);
      const orderItems = await tx.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [
        resInsert.insertId
      ]);
      return formatOrder(row, orderItems);
    });

    // Best-effort order confirmation email
    sendEmail({
      to: createdOrder.customerEmail,
      subject: `✨ Order Confirmed: ${createdOrder.orderNumber} — AURA JEWELS`,
      html: `<div style="font-family:Georgia,serif;color:#2C2724;max-width:560px;">
        <h2 style="color:#8E6C27;">Thank you, ${createdOrder.customerName} ✨</h2>
        <p>We have received your handcrafted order <strong>${createdOrder.orderNumber}</strong>.</p>
        <p><strong>Total:</strong> ₹${createdOrder.totalAmount.toLocaleString('en-IN')} (${createdOrder.paymentMethod.toUpperCase()})</p>
        <p><strong>Current Stage:</strong> ${createdOrder.orderStatus}</p>
        ${createdOrder.giftNote ? `<p><strong>Gift Note:</strong> "${createdOrder.giftNote}"</p>` : ''}
      </div>`
    }).catch(() => {});

    res.status(201).json({ order: createdOrder });
  })
);

/**
 * GET /api/orders/my — Signed-in customer's orders with line items.
 */
router.get(
  '/orders/my',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      'SELECT * FROM orders WHERE user_id = ? OR LOWER(customer_email) = ? ORDER BY id DESC',
      [req.user.id, req.user.email.toLowerCase()]
    );
    const orders = await attachOrderItems(rows);
    res.json({ orders });
  })
);

/**
 * GET /api/orders/track/:orderNumber — Public lightweight order progress lookup.
 */
router.get(
  '/orders/track/:orderNumber',
  asyncHandler(async (req, res) => {
    const code = String(req.params.orderNumber).trim().toUpperCase();
    const row = await queryOne('SELECT * FROM orders WHERE order_number = ?', [code]);
    if (!row) {
      throw new AppError(`No order found with number ${code}.`, 404);
    }
    res.json({
      orderNumber: row.order_number,
      status: row.order_status,
      paymentStatus: row.payment_status,
      courierName: row.courier_name || '',
      trackingNumber: row.tracking_number || '',
      trackingUrl: row.tracking_url || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  })
);

// =========================================================================
// ADMIN ENDPOINTS — DASHBOARD ANALYTICS & ORDER MANAGEMENT
// =========================================================================

/**
 * GET /api/admin/dashboard — Studio overview metrics, low stock alerts, and revenue trend.
 */
router.get(
  '/admin/dashboard',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [orderStats, customPending, prodCount, lowStockRows, subCount, inqCount, recentOrdersRaw, recentCustom] =
      await Promise.all([
        queryOne(`
          SELECT
            COUNT(*) AS totalOrders,
            COALESCE(SUM(CASE WHEN order_status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
            SUM(CASE WHEN order_status IN ('Order Placed', 'Crafting in Studio', 'Quality & Polish') THEN 1 ELSE 0 END) AS activeOrders
          FROM orders
        `),
        queryOne(
          "SELECT COUNT(*) AS cnt FROM custom_orders WHERE status IN ('Pending Review', 'Quote Sent', 'Approved & Crafting')"
        ),
        queryOne('SELECT COUNT(*) AS cnt FROM products WHERE is_active = 1'),
        query('SELECT id, slug, name, stock_qty, price FROM products WHERE stock_qty <= 8 ORDER BY stock_qty ASC LIMIT 6'),
        queryOne('SELECT COUNT(*) AS cnt FROM subscribers WHERE is_active = 1'),
        queryOne("SELECT COUNT(*) AS cnt FROM contact_messages WHERE status = 'New'"),
        query('SELECT * FROM orders ORDER BY id DESC LIMIT 5'),
        query('SELECT * FROM custom_orders ORDER BY id DESC LIMIT 5')
      ]);

    const recentOrders = await attachOrderItems(recentOrdersRaw);

    res.json({
      metrics: {
        totalRevenue: Number(orderStats?.totalRevenue || 0),
        totalOrders: Number(orderStats?.totalOrders || 0),
        activeOrders: Number(orderStats?.activeOrders || 0),
        pendingCustomRequests: Number(customPending?.cnt || 0),
        activeProducts: Number(prodCount?.cnt || 0),
        subscribersCount: Number(subCount?.cnt || 0),
        newInquiries: Number(inqCount?.cnt || 0)
      },
      lowStockProducts: lowStockRows.map((p) => ({
        dbId: Number(p.id),
        slug: p.slug,
        name: p.name,
        stockQty: Number(p.stock_qty),
        price: Number(p.price)
      })),
      recentOrders,
      recentCustomRequests: recentCustom.map((c) => ({
        id: Number(c.id),
        requestCode: c.request_code,
        customerName: c.customer_name,
        jewelryType: c.jewelry_type,
        crystal: c.crystal,
        budget: c.budget,
        quotedPrice: c.quoted_price ? Number(c.quoted_price) : null,
        status: c.status,
        createdAt: c.created_at
      }))
    });
  })
);

/**
 * GET /api/admin/orders — List all orders for Admin studio fulfillment.
 */
router.get(
  '/admin/orders',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const clauses = [];
    const params = [];

    if (status && status !== 'All') {
      clauses.push('order_status = ?');
      params.push(status);
    }
    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      clauses.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await query(`SELECT * FROM orders ${whereSql} ORDER BY id DESC`, params);
    const orders = await attachOrderItems(rows);
    res.json({ orders });
  })
);

/**
 * PUT /api/admin/orders/:id — Advance fulfillment stage, set courier tracking, & email customer.
 */
router.put(
  '/admin/orders/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      throw new AppError('Order not found.', 404);
    }

    const { orderStatus, paymentStatus, courierName, trackingNumber, trackingUrl, adminNotes } = req.body;
    if (orderStatus && !ORDER_STAGES.includes(orderStatus)) {
      throw new AppError('Invalid order status stage.', 400);
    }
    if (paymentStatus && !PAYMENT_STATUSES.has(paymentStatus)) {
      throw new AppError('Invalid payment status.', 400);
    }

    const nextStatus = orderStatus || existing.order_status;

    await execute(
      `UPDATE orders SET
        order_status = ?, payment_status = ?, courier_name = ?, tracking_number = ?, tracking_url = ?, admin_notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextStatus,
        paymentStatus || existing.payment_status,
        courierName !== undefined ? courierName.trim() : existing.courier_name || '',
        trackingNumber !== undefined ? trackingNumber.trim() : existing.tracking_number || '',
        trackingUrl !== undefined ? trackingUrl.trim() : existing.tracking_url || '',
        adminNotes !== undefined ? adminNotes.trim() : existing.admin_notes || '',
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    const items = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [id]);
    const formatted = formatOrder(updated, items);

    if (orderStatus && orderStatus !== existing.order_status && formatted.customerEmail) {
      sendEmail({
        to: formatted.customerEmail,
        subject: `Order ${formatted.orderNumber} Update: ${formatted.orderStatus} ✨`,
        html: `<div style="font-family:Georgia,serif;color:#2C2724;max-width:560px;">
          <h2 style="color:#8E6C27;">Your AURA JEWELS Update</h2>
          <p>Hi ${formatted.customerName}, your order <strong>${formatted.orderNumber}</strong> is now: <strong>${formatted.orderStatus}</strong>.</p>
          ${formatted.courierName || formatted.trackingNumber ? `<p><strong>Courier:</strong> ${formatted.courierName || 'Studio Partner'} • <strong>AWB/Tracking:</strong> ${formatted.trackingNumber}</p>` : ''}
          ${formatted.trackingUrl ? `<p><a href="${formatted.trackingUrl}">Track Package Live</a></p>` : ''}
        </div>`
      }).catch(() => {});
    }

    res.json({ order: formatted });
  })
);

export default router;
