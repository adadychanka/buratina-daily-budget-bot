import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import type { BotContext } from "../../types/bot";
import { validateAmount } from "../../utils/validators";
import { formatAmount } from "../../utils/formatters";
import { logger } from "../../config/logger";

export const reportScene = new Scenes.BaseScene<BotContext>("report");

// Scene entry handler
reportScene.enter(async (ctx) => {
  try {
    // Clear any previous report data
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.reportData = {};
    ctx.session.step = "cash_amount";

    await ctx.reply("📊 Let's create a new report!\n\nEnter Cash amount:");
    logger.info(`User ${ctx.from?.id} entered report scene`);
  } catch (error) {
    logger.error("Error in report scene entry:", error);
    await ctx.reply("An error occurred. Please try again later.");
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

    await ctx.reply("❌ Report cancelled.");
    logger.info(`User ${ctx.from?.id} cancelled report`);
    await ctx.scene.leave();
  } catch (error) {
    logger.error("Error cancelling report:", error);
    await ctx.reply("An error occurred while cancelling.");
    await ctx.scene.leave();
  }
});

// Text input handler
reportScene.on(message("text"), async (ctx) => {
  try {
    const userInput = ctx.message.text;
    const currentStep = ctx.session?.step;

    if (currentStep === "cash_amount") {
      // Validate the cash amount
      const validation = validateAmount(userInput);

      if (!validation.isValid) {
        // Invalid input - ask again
        await ctx.reply(
          `❌ ${validation.error}\n\nPlease enter a valid Cash amount:`
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
      ctx.session.step = "white_cash_amount";

      // Show interim summary
      const interim = `✅ Cash amount saved: ${formatAmount(
        validation.amount ?? 0
      )}

Enter White Cash amount:`;

      await ctx.reply(interim);
      logger.info(
        `User ${ctx.from?.id} entered cash amount: ${validation.amount}`
      );
    } else if (currentStep === "white_cash_amount") {
      // Validate the white cash amount
      const validation = validateAmount(userInput);

      if (!validation.isValid) {
        // Invalid input - ask again
        await ctx.reply(
          `❌ ${validation.error}\n\nPlease enter a valid White Cash amount:`
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

      const summary = `✅ White Cash amount saved: ${formatAmount(
        whiteCashAmount
      )}

📊 Report Summary:

💰 Cash: ${formatAmount(cashAmount)}
💳 White Cash: ${formatAmount(whiteCashAmount)}

Report completed! (More fields will be added later)`;

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
    await ctx.reply("An error occurred. Please try again or use /cancel.");
  }
});
