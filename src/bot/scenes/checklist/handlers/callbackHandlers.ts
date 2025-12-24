import { logger } from '../../../../config/logger';
import { GoogleSheetsService } from '../../../../services/google-sheets';
import type { BotContext, Checklist } from '../../../../types/bot';
import { CALLBACKS, CHECKLIST_STEPS, MESSAGES } from '../../../../utils/constants';
import { formatChecklistDisplay } from '../helpers/checklistHelpers';
import { getChecklistMotivationalMessage } from '../helpers/greetingHelpers';
import { getChecklistActionsKeyboard } from '../helpers/messageHelpers';
import {
  clearChecklistData,
  initializeChecklistData,
  setChecklistStep,
} from '../helpers/stateHelpers';

/**
 * Handle checklist selection from list
 */
export async function handleChecklistSelection(ctx: BotContext, callbackData: string) {
  try {
    // Get checklist names from session
    const checklistNames = ctx.session.checklistData?.names || [];

    // Parse index from callback data (format: "checklist_select_0")
    const parts = callbackData.split('_');
    const indexString = parts[parts.length - 1]; // Get last part after last underscore
    const index = parseInt(indexString, 10);

    logger.info('Checklist selection attempt', {
      userId: ctx.from?.id,
      callbackData,
      parts,
      indexString,
      parsedIndex: index,
      isNaN: Number.isNaN(index),
      checklistNamesCount: checklistNames.length,
      checklistNames: checklistNames,
    });

    if (Number.isNaN(index) || index < 0 || index >= checklistNames.length) {
      logger.warn('Invalid checklist selection', {
        userId: ctx.from?.id,
        callbackData,
        parts,
        indexString,
        parsedIndex: index,
        isNaN: Number.isNaN(index),
        checklistNamesCount: checklistNames.length,
        isValidIndex: !Number.isNaN(index) && index >= 0 && index < checklistNames.length,
      });
      await ctx.answerCbQuery('Invalid checklist selection');
      return;
    }

    const selectedChecklistName = checklistNames[index];

    // Initialize checklist data in session
    initializeChecklistData(ctx);
    if (ctx.session.checklistData) {
      ctx.session.checklistData.selectedChecklist = selectedChecklistName;
    }
    setChecklistStep(ctx, CHECKLIST_STEPS.VIEWING);

    // Load checklist data from Google Sheets
    const sheetsService = new GoogleSheetsService();
    const rawData = await sheetsService.getChecklistData(selectedChecklistName);

    // Convert to Checklist type (structure is already correct)
    const checklist: Checklist = {
      name: rawData.name,
      categories: rawData.categories,
      itemsWithoutCategory: rawData.itemsWithoutCategory,
    };

    // Format and display checklist
    const messages = formatChecklistDisplay(checklist);
    const motivationalMessage = getChecklistMotivationalMessage();

    await ctx.answerCbQuery();

    // Send first message with motivational message
    if (messages.length > 0) {
      const firstMessage = `${motivationalMessage}\n\n${messages[0]}`;
      const isOnlyMessage = messages.length === 1;

      await ctx.editMessageText(firstMessage, {
        parse_mode: 'Markdown',
        reply_markup: isOnlyMessage ? getChecklistActionsKeyboard().reply_markup : undefined,
      });

      // Send additional messages if checklist is too long
      // Add buttons only to the last message
      for (let i = 1; i < messages.length; i++) {
        const isLastMessage = i === messages.length - 1;
        await ctx.reply(messages[i], {
          parse_mode: 'Markdown',
          reply_markup: isLastMessage ? getChecklistActionsKeyboard().reply_markup : undefined,
        });
      }
    }

    logger.info(`User ${ctx.from?.id} selected checklist: ${selectedChecklistName}`);
  } catch (error) {
    logger.error('Error handling checklist selection:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.CHECKLIST_ERROR);
  }
}

/**
 * Handle checklist completion
 */
export async function handleCompleteChecklist(ctx: BotContext) {
  try {
    await ctx.answerCbQuery();

    setChecklistStep(ctx, CHECKLIST_STEPS.COMPLETED);

    await ctx.editMessageText(MESSAGES.CHECKLIST_COMPLETED);
    logger.info(`User ${ctx.from?.id} completed checklist`);

    // Leave scene
    await ctx.scene.leave();
  } catch (error) {
    logger.error('Error handling checklist completion:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Handle checklist cancellation
 */
export async function handleCancelChecklist(ctx: BotContext) {
  try {
    await ctx.answerCbQuery();

    clearChecklistData(ctx);

    await ctx.editMessageText(MESSAGES.CHECKLIST_CANCELLED);
    logger.info(`User ${ctx.from?.id} cancelled checklist`);

    // Leave scene
    await ctx.scene.leave();
  } catch (error) {
    logger.error('Error handling checklist cancellation:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Main callback query handler for checklist scene
 */
export async function handleCallbackQuery(ctx: BotContext) {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : null;

  if (!callbackData) {
    logger.warn('Invalid callback query - no data', {
      userId: ctx.from?.id,
      callbackQuery: ctx.callbackQuery,
    });
    await ctx.answerCbQuery('Invalid callback');
    return;
  }

  logger.debug('Checklist callback query received', {
    userId: ctx.from?.id,
    callbackData,
    expectedPrefix: CALLBACKS.CHECKLIST_SELECT,
  });

  try {
    // Handle checklist selection
    if (callbackData.startsWith(`${CALLBACKS.CHECKLIST_SELECT}_`)) {
      await handleChecklistSelection(ctx, callbackData);
      return;
    }

    // Handle other callbacks
    switch (callbackData) {
      case CALLBACKS.CHECKLIST_COMPLETE:
        await handleCompleteChecklist(ctx);
        break;
      case CALLBACKS.CHECKLIST_CANCEL:
        await handleCancelChecklist(ctx);
        break;
      default:
        await ctx.answerCbQuery('Unknown action');
        logger.warn(`Unknown callback data in checklist scene: ${callbackData}`);
    }
  } catch (error) {
    logger.error('Error handling callback query in checklist scene:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.CHECKLIST_ERROR);
  }
}

/**
 * Load and store checklist names in session
 * This should be called when entering the scene
 */
export async function loadChecklistNames(ctx: BotContext): Promise<string[]> {
  try {
    const sheetsService = new GoogleSheetsService();
    const names = await sheetsService.getSheetNames();

    logger.info('Loaded checklist names', {
      userId: ctx.from?.id,
      count: names.length,
      names: names,
    });

    // Store in session for callback handling
    initializeChecklistData(ctx);
    if (ctx.session.checklistData) {
      ctx.session.checklistData.names = names;
      logger.debug('Stored checklist names in session', {
        userId: ctx.from?.id,
        storedCount: ctx.session.checklistData.names?.length || 0,
      });
    }

    return names;
  } catch (error) {
    logger.error('Error loading checklist names:', error);
    throw error;
  }
}
