import { MESSAGES } from '../../../../utils/constants';

/**
 * Get a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random motivational message for when a checklist is selected
 * These messages are shown before displaying the checklist content
 */
export function getChecklistMotivationalMessage(): string {
  return getRandomElement([...MESSAGES.CHECKLIST_MOTIVATIONAL_MESSAGES]);
}
