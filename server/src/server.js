import 'dotenv/config';
import { initDatabase } from './config/db.js';
import { initializeSchemaAndSeed } from './config/initDb.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
  const dialect = await initDatabase();
  await initializeSchemaAndSeed();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`\n✨ AURA JEWELS API running on http://localhost:${PORT}`);
    console.log(`📦 Database client: ${dialect.toUpperCase()}`);
    console.log(
      `💳 Razorpay live keys: ${
        process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'Configured' : 'Demo mode (keys blank in .env)'
      }\n`
    );
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start AURA JEWELS backend:', err);
  process.exit(1);
});
