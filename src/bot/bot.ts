import { session, Telegraf } from 'telegraf';
import { logger } from '../config/logger';
import { config } from '../config/settings';
import type { BotContext } from '../types/bot';
import { helpHandler } from './handlers/help';
import { historyHandler } from './handlers/history';
import { startHandler } from './handlers/start';

export class Bot {
  private bot: Telegraf<BotContext>;

  constructor() {
    this.bot = new Telegraf<BotContext>(config.botToken);
    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    // Session middleware
    this.bot.use(session());

    // Logging middleware
    this.bot.use((ctx, next) => {
      const messageText =
        ctx.message && 'text' in ctx.message ? ctx.message.text : 'non-text message';
      logger.info(`User ${ctx.from?.id} sent message: ${messageText}`);
      return next();
    });
  }

  private setupHandlers() {
    // Command handlers
    this.bot.start(startHandler);
    this.bot.help(helpHandler);
    this.bot.command('history', historyHandler);

    // Simple report handler (temporary)
    this.bot.command('report', (ctx) => {
      ctx.reply(
        'Report creation feature will be added soon. Please use /help for more information.'
      );
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error('Bot error:', err);
      ctx.reply('An error occurred. Please try again later.');
    });
  }

  async start() {
    try {
      await this.bot.launch();
      logger.info('Bot launched successfully');
    } catch (error) {
      logger.error('Failed to launch bot:', error);
      throw error;
    }
  }

  async stop() {
    try {
      this.bot.stop();
      logger.info('Bot stopped');
    } catch (error) {
      logger.error('Failed to stop bot:', error);
      throw error;
    }
  }
}
