import type { Checklist } from '../../../../types/bot';
import { MESSAGES } from '../../../../utils/constants';

/**
 * Maximum message length for Telegram (with safety margin)
 */
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Format a section (category or items without category) for display
 */
function formatSection(title: string, items: Array<{ text: string }>): string {
  return `📋 *${title}*\n${items.map((item, index) => `${index + 1}. ${item.text}`).join('\n\n')}\n\n`;
}

/**
 * Add section to message or create new message if needed
 */
function addSectionToMessages(
  messages: string[],
  currentMessage: string,
  section: string,
  checklistName: string
): { messages: string[]; currentMessage: string } {
  if (currentMessage.length + section.length > MAX_MESSAGE_LENGTH) {
    // Save current message and start new one with continuation header
    messages.push(currentMessage.trim());
    const continuationHeader = `📋 *${checklistName}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n`;
    return {
      messages,
      currentMessage: continuationHeader + section,
    };
  }
  return {
    messages,
    currentMessage: currentMessage + section,
  };
}

/**
 * Format checklist for display in Telegram message
 * Returns formatted text with categories and items
 * Handles message length limit (4096 characters) by splitting if needed
 */
export function formatChecklistDisplay(checklist: Checklist): string[] {
  const messages: string[] = [];
  let currentMessage = `📋 *${checklist.name}*\n\n`;

  // Add categories with items
  for (const category of checklist.categories) {
    if (category.items.length === 0) {
      continue; // Skip empty categories
    }

    const categorySection = formatSection(category.name, category.items);

    const result = addSectionToMessages(messages, currentMessage, categorySection, checklist.name);
    messages.splice(0, messages.length, ...result.messages);
    currentMessage = result.currentMessage;
  }

  // Add items without category
  if (checklist.itemsWithoutCategory.length > 0) {
    const itemsSection = formatSection(
      MESSAGES.CHECKLIST_NO_CATEGORY,
      checklist.itemsWithoutCategory
    );

    const result = addSectionToMessages(messages, currentMessage, itemsSection, checklist.name);
    messages.splice(0, messages.length, ...result.messages);
    currentMessage = result.currentMessage;
  }

  // Add last message if not empty
  if (currentMessage.trim().length > 0) {
    messages.push(currentMessage.trim());
  }

  return messages.length > 0 ? messages : [MESSAGES.CHECKLIST_EMPTY];
}
