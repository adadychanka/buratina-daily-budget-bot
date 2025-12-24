import type { Checklist } from '../../../../types/bot';
import { MESSAGES } from '../../../../utils/constants';

/**
 * Maximum message length for Telegram (with safety margin)
 * Reduced to account for motivational message that will be prepended to first message
 */
const MAX_MESSAGE_LENGTH = 3900;

/**
 * Format a section (category or items without category) for display
 */
function formatSection(title: string, items: Array<{ text: string }>): string {
  return `📋 *${title}*\n${items.map((item, index) => `${index + 1}. ${item.text}`).join('\n\n')}\n\n`;
}

/**
 * Split a long section into multiple parts that fit within MAX_MESSAGE_LENGTH
 */
function splitSection(
  title: string,
  items: Array<{ text: string }>,
  checklistName: string
): string[] {
  const parts: string[] = [];
  let currentPart = `📋 *${title}*\n`;
  let itemIndex = 1;

  for (const item of items) {
    const itemText = `${itemIndex}. ${item.text}\n\n`;

    // If adding this item would exceed limit, save current part and start new one
    if (currentPart.length + itemText.length > MAX_MESSAGE_LENGTH) {
      if (currentPart.trim().length > 0) {
        parts.push(currentPart.trim());
      }
      const continuationHeader = `📋 *${checklistName}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n📋 *${title}*\n`;
      currentPart = continuationHeader + itemText;
    } else {
      currentPart += itemText;
    }
    itemIndex++;
  }

  if (currentPart.trim().length > 0) {
    parts.push(currentPart.trim());
  }

  return parts;
}

/**
 * Add section to message or create new message if needed
 * Simplified: if section doesn't fit, save current message and start new one
 */
function addSectionToMessages(
  messages: string[],
  currentMessage: string,
  section: string,
  checklistName: string
): { messages: string[]; currentMessage: string } {
  // If section doesn't fit in current message, save current and start new one
  if (currentMessage.length + section.length > MAX_MESSAGE_LENGTH) {
    // Save current message first
    if (currentMessage.trim().length > 0) {
      messages.push(currentMessage.trim());
    }

    // Start new message with continuation header + section
    const continuationHeader = `📋 *${checklistName}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n`;
    const newMessage = continuationHeader + section;

    // If new message still exceeds limit, the section itself is too long
    // This should be handled by caller (splitSection), but we check for safety
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      // Return just the continuation header - caller should handle splitting
      return {
        messages,
        currentMessage: continuationHeader,
      };
    }

    return {
      messages,
      currentMessage: newMessage,
    };
  }

  // Section fits, add it to current message
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

  // Add categories with items - each category starts a new message if it doesn't fit
  for (const category of checklist.categories) {
    if (category.items.length === 0) {
      continue; // Skip empty categories
    }

    const categorySection = formatSection(category.name, category.items);

    // If category itself exceeds limit, split it into multiple parts
    if (categorySection.length > MAX_MESSAGE_LENGTH) {
      const sectionParts = splitSection(category.name, category.items, checklist.name);

      // Check if currentMessage is just the checklist header (first message)
      const isFirstMessage = currentMessage.trim() === `📋 *${checklist.name}*\n\n`.trim();

      // Save current message and add each part as a separate message
      if (currentMessage.trim().length > 0 && !isFirstMessage) {
        messages.push(currentMessage.trim());
      }

      // Each part becomes a new message
      // splitSection already adds continuation header to parts after the first one
      for (let i = 0; i < sectionParts.length; i++) {
        let partMessage = sectionParts[i];

        // If this is the first part and we have messages already (or currentMessage was not first),
        // add continuation header. But if currentMessage was the first message, prepend it to first part
        if (i === 0) {
          if (isFirstMessage) {
            // Prepend the checklist header to first part
            partMessage = currentMessage + sectionParts[i];
          } else if (messages.length > 0) {
            // Not first message - add continuation header
            const continuationHeader = `📋 *${checklist.name}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n`;
            partMessage = continuationHeader + sectionParts[i];
          }
          // Otherwise, first part is already correct (just category header)
        }

        if (partMessage.length > MAX_MESSAGE_LENGTH) {
          // This shouldn't happen if splitSection works correctly, but handle it
          const continuationHeader = `📋 *${checklist.name}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n`;
          messages.push(continuationHeader.trim());
          currentMessage = sectionParts[i];
        } else {
          messages.push(partMessage);
          currentMessage = '';
        }
      }
    } else {
      // Category fits in one message - check if it fits in current message
      if (currentMessage.length + categorySection.length > MAX_MESSAGE_LENGTH) {
        // Save current message and start new one with this category
        if (currentMessage.trim().length > 0) {
          messages.push(currentMessage.trim());
        }
        const continuationHeader = `📋 *${checklist.name}* ${MESSAGES.CHECKLIST_CONTINUATION}\n\n`;
        currentMessage = continuationHeader + categorySection;
      } else {
        // Category fits in current message, add it
        currentMessage += categorySection;
      }
    }
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
