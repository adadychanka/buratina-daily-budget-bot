import dotenv from 'dotenv';
import { Bot } from './bot/bot';
import { logger } from './config/logger';

// Load environment variables based on NODE_ENV
// Priority: .env.local > .env.{NODE_ENV} > .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: '.env.local' }); // Local overrides (not in git)
dotenv.config({ path: `.env.${nodeEnv}` }); // Environment-specific
dotenv.config(); // Default .env

async function main() {
  try {
    logger.info('Starting Daily Budget Bot...');

    const bot = new Bot();
    await bot.start();

    logger.info('Bot started successfully!');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();
