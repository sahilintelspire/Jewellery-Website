import express from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { execute, query, queryOne } from '../config/db.js';
import { requireAuth, signAuthToken } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeUser } from '../utils/json.js';
import { sendEmail } from '../services/mailer.js';

const router = express.Router();

function formatAddress(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    phone: row.phone,
    pincode: row.pincode,
    line1: row.line1,
    line2: row.line2 || '',
    city: row.city,
    state: row.state,
    type: row.address_type || 'Home',
    isDefault: Boolean(row.is_default)
  };
}

/**
 * POST /api/auth/register — Create a new customer account.
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, phone = '', password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError('Name, email, and password are required.', 400);
    }
    if (String(password).length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      throw new AppError('An account with this email already exists. Please sign in.', 409);
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const result = await execute(
      `INSERT INTO users (name, email, phone, password_hash, role, auth_provider)
       VALUES (?, ?, ?, ?, 'customer', 'email')`,
      [name.trim(), cleanEmail, String(phone).trim(), passwordHash]
    );

    const userRow = await queryOne('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = sanitizeUser(userRow);
    const token = signAuthToken(user);

    res.status(201).json({ user, token, addresses: [] });
  })
);

/**
 * POST /api/auth/login — Authenticate with email & password.
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      throw new AppError('Email and password are required.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRow = await queryOne('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!userRow) {
      throw new AppError('Invalid email or password.', 401);
    }
    if (!userRow.password_hash) {
      throw new AppError('This account uses Google Sign-In. Please continue with Google.', 400);
    }

    const match = await bcrypt.compare(String(password), userRow.password_hash);
    if (!match) {
      throw new AppError('Invalid email or password.', 401);
    }

    const user = sanitizeUser(userRow);
    const addresses = (
      await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [user.id])
    ).map(formatAddress);

    res.json({ user, token: signAuthToken(user), addresses });
  })
);

/**
 * POST /api/auth/google — Verify real Google ID token (or local dev fallback when unconfigured).
 */
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { idToken, email, name, avatarUrl, googleSub } = req.body;
    const configuredClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();

    let resolvedEmail = null;
    let resolvedName = null;
    let resolvedAvatar = avatarUrl || null;
    let resolvedSub = googleSub || null;

    if (configuredClientId && idToken) {
      const client = new OAuth2Client(configuredClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: configuredClientId
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new AppError('Google token did not include a verified email address.', 400);
      }
      resolvedEmail = payload.email.toLowerCase().trim();
      resolvedName = payload.name || resolvedEmail.split('@')[0];
      resolvedAvatar = payload.picture || null;
      resolvedSub = payload.sub;
    } else if (!configuredClientId && process.env.NODE_ENV !== 'production' && email) {
      // Development fallback before Google Cloud Client ID is pasted into .env
      resolvedEmail = String(email).toLowerCase().trim();
      resolvedName = (name || resolvedEmail.split('@')[0]).trim();
      resolvedSub = resolvedSub || `dev-google-${resolvedEmail}`;
    } else {
      throw new AppError(
        'Google OAuth is not configured on this server yet. Please set GOOGLE_CLIENT_ID in .env.',
        400
      );
    }

    let userRow = await queryOne('SELECT * FROM users WHERE email = ?', [resolvedEmail]);
    if (!userRow) {
      const result = await execute(
        `INSERT INTO users (name, email, role, auth_provider, google_sub, avatar_url)
         VALUES (?, ?, 'customer', 'google', ?, ?)`,
        [resolvedName, resolvedEmail, resolvedSub, resolvedAvatar]
      );
      userRow = await queryOne('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else if (!userRow.google_sub || (resolvedAvatar && resolvedAvatar !== userRow.avatar_url)) {
      await execute(
        `UPDATE users SET google_sub = COALESCE(google_sub, ?), avatar_url = COALESCE(?, avatar_url) WHERE id = ?`,
        [resolvedSub, resolvedAvatar, userRow.id]
      );
      userRow = await queryOne('SELECT * FROM users WHERE id = ?', [userRow.id]);
    }

    const user = sanitizeUser(userRow);
    const addresses = (
      await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [user.id])
    ).map(formatAddress);

    res.json({ user, token: signAuthToken(user), addresses });
  })
);

/**
 * GET /api/auth/me — Get current user profile & saved addresses.
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const addresses = (
      await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.user.id])
    ).map(formatAddress);
    res.json({ user: req.user, addresses });
  })
);

/**
 * PUT /api/auth/profile — Update current user's name, phone, or password.
 */
router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone, currentPassword, newPassword } = req.body;
    const currentRow = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);

    let nextHash = currentRow.password_hash;
    if (newPassword) {
      if (String(newPassword).length < 6) {
        throw new AppError('New password must be at least 6 characters.', 400);
      }
      if (currentRow.password_hash) {
        if (!currentPassword) {
          throw new AppError('Please provide your current password to change it.', 400);
        }
        const ok = await bcrypt.compare(String(currentPassword), currentRow.password_hash);
        if (!ok) {
          throw new AppError('Current password is incorrect.', 400);
        }
      }
      nextHash = await bcrypt.hash(String(newPassword), 10);
    }

    await execute(
      `UPDATE users SET name = ?, phone = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        (name ?? currentRow.name).trim(),
        phone !== undefined ? String(phone).trim() : currentRow.phone,
        nextHash,
        req.user.id
      ]
    );

    const updated = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: sanitizeUser(updated) });
  })
);

/**
 * POST /api/auth/forgot-password — Generate 6-digit password reset code.
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) {
      throw new AppError('Please enter your email address.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await queryOne('SELECT id, name, email FROM users WHERE email = ?', [cleanEmail]);

    // Always respond cleanly without leaking account existence in production
    if (!user) {
      return res.json({
        ok: true,
        message: 'If an account matches this email, a reset code has been dispatched.'
      });
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const expiresIso = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await execute('UPDATE users SET reset_otp = ?, reset_expires = ? WHERE id = ?', [
      otp,
      expiresIso,
      user.id
    ]);

    const mailResult = await sendEmail({
      to: user.email,
      subject: 'Your AURA JEWELS Password Reset Code',
      text: `Hi ${user.name},\n\nYour password reset verification code is: ${otp}\nValid for 15 minutes.`,
      html: `<p>Hi ${user.name},</p><p>Your <strong>AURA JEWELS</strong> password reset code is:</p><h2 style="letter-spacing:4px;color:#8E6C27;">${otp}</h2><p>This code expires in 15 minutes.</p>`
    });

    res.json({
      ok: true,
      message: 'Verification code generated and sent to your email.',
      ...(mailResult.previewMode && process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {})
    });
  })
);

/**
 * POST /api/auth/reset-password — Verify OTP & set new password.
 */
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email?.trim() || !otp?.trim() || !newPassword) {
      throw new AppError('Email, reset code, and new password are required.', 400);
    }
    if (String(newPassword).length < 6) {
      throw new AppError('New password must be at least 6 characters.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user || !user.reset_otp || user.reset_otp !== String(otp).trim()) {
      throw new AppError('Invalid or expired verification code.', 400);
    }
    if (user.reset_expires && Date.now() > new Date(user.reset_expires).getTime()) {
      throw new AppError('Verification code has expired. Please request a new one.', 400);
    }

    const hash = await bcrypt.hash(String(newPassword), 10);
    await execute(
      `UPDATE users SET password_hash = ?, reset_otp = NULL, reset_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [hash, user.id]
    );

    res.json({ ok: true, message: 'Password updated successfully. Please sign in.' });
  })
);

export default router;
