import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.resolve(__dirname, '..', '..', 'uploads');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError('Only JPG, PNG, and WebP images are supported.', 400));
    }
    cb(null, true);
  }
});

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadBufferToCloudinary(file, folder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');

  const form = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  form.append('file', blob, file.originalname || 'jewellery.jpg');
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });
  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new AppError(data.error?.message || 'Cloudinary image upload failed.', 502);
  }
  return data.secure_url;
}

async function storeUploadedFile(file, subfolder) {
  if (isCloudinaryConfigured()) {
    return uploadBufferToCloudinary(file, `aura-jewels/${subfolder}`);
  }

  const targetDir = path.join(UPLOADS_ROOT, subfolder);
  fs.mkdirSync(targetDir, { recursive: true });

  const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
  const fullPath = path.join(targetDir, fileName);

  await fs.promises.writeFile(fullPath, file.buffer);
  return `/uploads/${subfolder}/${fileName}`;
}

/**
 * POST /api/upload/products — Admin product gallery upload (1 to 6 images).
 */
router.post(
  '/products',
  requireAuth,
  requireAdmin,
  upload.array('images', 6),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (files.length === 0) {
      throw new AppError('Please choose at least one image file to upload.', 400);
    }

    const urls = await Promise.all(files.map((file) => storeUploadedFile(file, 'products')));
    res.status(201).json({
      urls,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local'
    });
  })
);

/**
 * POST /api/upload/custom-reference — Customer bespoke inspiration image upload.
 */
router.post(
  '/custom-reference',
  optionalAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Please select a reference photo to upload.', 400);
    }

    const url = await storeUploadedFile(req.file, 'custom');
    res.status(201).json({
      url,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local'
    });
  })
);

export default router;
