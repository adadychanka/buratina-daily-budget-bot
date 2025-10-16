import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import type { BotContext } from "../../types/bot";
import { validateAmount } from "../../utils/validators";
import { formatAmount } from "../../utils/formatters";
import { logger } from "../../config/logger";
import {
  SCENES,
  REPORT_STEPS,
  MESSAGES,
  PROMPTS,
} from "../../utils/constants";

export const reportScene = new Scenes.BaseScene<BotContext>(SCENES.REPORT);

// Scene entry handler
reportScene.enter(async (ctx) => {
  try {
    // Clear any previous report data
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.reportData = {};
    ctx.session.step = REPORT_STEPS.CASH_AMOUNT;

    await ctx.reply(
      `${MESSAGES.REPORT_START}\n\n${PROMPTS.CASH_AMOUNT}`
    );
    logger.info(`User ${ctx.from?.id} entered report scene`);
  } catch (error) {
    logger.error("Error in report scene entry:", error);
    await ctx.reply(MESSAGES.ERROR);
    await ctx.scene.leave();
  }
});

// Cancel command handler
reportScene.command("cancel", async (ctx) => {
  try {
    // Clear session data
    if (ctx.session) {
      ctx.session.reportData = undefined;
      ctx.session.step = undefined;
    }

    await ctx.reply(MESSAGES.REPORT_CANCELLED);
    logger.info(`User ${ctx.from?.id} cancelled report`);
    await ctx.scene.leave();
  } catch (error) {
    logger.error("Error cancelling report:", error);
    await ctx.reply(MESSAGES.ERROR);
    await ctx.scene.leave();
  }
});

// Text input handler
reportScene.on(message("text"), async (ctx) => {
  try {
    const userInput = ctx.message.text;
    const currentStep = ctx.session?.step;

    if (currentStep === REPORT_STEPS.CASH_AMOUNT) {
      // Validate the cash amount
      const validation = validateAmount(userInput);

      if (!validation.isValid) {
        // Invalid input - ask again
        await ctx.reply(
          `❌ ${validation.error}\n\n${PROMPTS.INVALID_AMOUNT}`
        );
        return;
      }

      // Valid input - store and move to next step
      if (!ctx.session) {
        ctx.session = {};
      }
      if (!ctx.session.reportData) {
        ctx.session.reportData = {};
      }
      ctx.session.reportData.cashAmount = validation.amount;
      ctx.session.step = REPORT_STEPS.WHITE_CASH_AMOUNT;

      // Show interim summary
      const interim = `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(
        validation.amount ?? 0
      )}

${PROMPTS.WHITE_CASH_AMOUNT}`;

      await ctx.reply(interim);
      logger.info(
        `User ${ctx.from?.id} entered cash amount: ${validation.amount}`
      );
    } else if (currentStep === REPORT_STEPS.WHITE_CASH_AMOUNT) {
      // Validate the white cash amount
      const validation = validateAmount(userInput);

      if (!validation.isValid) {
        // Invalid input - ask again
        await ctx.reply(
          `❌ ${validation.error}\n\n${PROMPTS.INVALID_AMOUNT}`
        );
        return;
      }

      // Valid input - store and show summary
      if (!ctx.session.reportData) {
        ctx.session.reportData = {};
      }
      ctx.session.reportData.whiteCashAmount = validation.amount;

      // Show final report summary with all collected fields
      const cashAmount = ctx.session.reportData.cashAmount ?? 0;
      const whiteCashAmount = validation.amount ?? 0;

      const summary = `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(
        whiteCashAmount
      )}

${MESSAGES.REPORT_SUMMARY}

💰 Cash: ${formatAmount(cashAmount)}
💳 White Cash: ${formatAmount(whiteCashAmount)}

${MESSAGES.REPORT_COMPLETED}`;

      await ctx.reply(summary);
      logger.info(
        `User ${ctx.from?.id} completed report with cash: ${cashAmount}, white cash: ${whiteCashAmount}`
      );

      // Clear session data and exit scene
      ctx.session.reportData = undefined;
      ctx.session.step = undefined;
      await ctx.scene.leave();
    }
  } catch (error) {
    logger.error("Error processing text input in report scene:", error);
    await ctx.reply(MESSAGES.REPORT_ERROR);
  }
});
