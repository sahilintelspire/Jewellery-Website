import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import helmet from 'helmet';
import { getDialect } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customOrderRoutes from './routes/customOrderRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          return cb(null, true);
        }
        return cb(new Error('Origin not allowed by CORS'));
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded product & bespoke inspiration images
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'AURA JEWELS Studio API',
      dialect: getDialect(),
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api', categoryRoutes);
  app.use('/api', productRoutes);
  app.use('/api', customOrderRoutes);
  app.use('/api', orderRoutes);
  app.use('/api', settingsRoutes);

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Serve built Vite SPA in production single-server deployments (Coolify / Railway / VPS)
  const clientDistDir = path.resolve(__dirname, '..', '..', 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientDistDir, 'index.html'))) {
    app.use(express.static(clientDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
