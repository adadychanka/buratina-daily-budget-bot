import { Scenes, session, Telegraf } from 'telegraf';
import { logger } from '../config/logger';
import { config } from '../config/settings';
import type { BotContext } from '../types/bot';
import { MESSAGES, SCENES } from '../utils/constants';
import { helpHandler } from './handlers/help';
import { historyHandler } from './handlers/history';
import { startHandler } from './handlers/start';
import { cashboxScene } from './scenes/cashbox/cashbox';
import { checklistScene } from './scenes/checklist/checklist';
import { reportScene } from './scenes/report/report';

export class Bot {
  private bot: Telegraf<BotContext>;
  private stage;

  constructor() {
    this.bot = new Telegraf<BotContext>(config.botToken);

    // Create stage with scenes
    this.stage = new Scenes.Stage<BotContext>([reportScene, checklistScene, cashboxScene]);

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    // Session middleware (must be before stage)
    this.bot.use(session());

    // Stage middleware
    this.bot.use(this.stage.middleware());

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

    // Report command - enter the report scene
    this.bot.command('report', (ctx) => ctx.scene.enter(SCENES.REPORT));

    // Checklist command - enter the checklist scene
    this.bot.command('checklist', (ctx) => ctx.scene.enter(SCENES.CHECKLIST));

    // Cashbox command - enter the cashbox scene
    this.bot.command('cashbox', (ctx) => ctx.scene.enter(SCENES.CASHBOX));

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error('Bot error:', err);
      ctx.reply(MESSAGES.ERROR);
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
