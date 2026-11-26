import jwt from 'jsonwebtoken';
import { queryOne } from '../config/db.js';
import { sanitizeUser } from '../utils/json.js';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'aura_dev_fallback_secret_change_me';
}

/**
 * Issue a signed JWT token for an authenticated user.
 */
export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || 'customer'
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

/**
 * Require a valid Bearer JWT and attach the sanitized user row to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists. Please sign in again.' });
    }

    req.user = sanitizeUser(user);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

/**
 * Attach req.user if a valid Bearer token is provided; otherwise proceed anonymously.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const payload = jwt.verify(token, getJwtSecret());
      const user = await queryOne('SELECT * FROM users WHERE id = ?', [payload.sub]);
      if (user) {
        req.user = sanitizeUser(user);
      }
    }
  } catch {
    // Ignore invalid optional token for guest actions
  }
  next();
}

/**
 * Restrict endpoint strictly to Admin accounts.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Studio Admin access required.' });
  }
  return next();
}
