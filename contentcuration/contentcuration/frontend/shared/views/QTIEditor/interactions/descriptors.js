import { Placement } from '../constants';
import { choiceInteractionDescriptor } from './choice/Descriptor';
import { textEntryInteractionDescriptor } from './textEntry/Descriptor';
import { orderingInteractionDescriptor } from './ordering/Descriptor';
import { associateInteractionDescriptor } from './associate/Descriptor';
import { matchInteractionDescriptor } from './match/Descriptor';

/**
 * Every interaction's descriptor: matching, parsing, building and validating XML.
 *
 * This module imports `Descriptor.js` files only so that headless validation can be done withou
 * the bundle size cost of the editors.
 *
 * Registering a new interaction means adding its descriptor here and its editor in index.js
 */

/**
 * Ordered list of all registered interaction descriptors.
 * Searched in order; the first whose `matches(el)` returns true wins.
 */
export const descriptors = [
  choiceInteractionDescriptor,
  textEntryInteractionDescriptor,
  orderingInteractionDescriptor,
  associateInteractionDescriptor,
  matchInteractionDescriptor,
];

/**
 * @type {Object.<string, import('./InteractionDescriptor').InteractionDescriptor>}
 */
export const registry = Object.fromEntries(descriptors.map(d => [d.type, d]));

/**
 * Whether an interaction is authored inline, and so needs the whole item body to parse
 * rather than its own element. Read off the descriptor's placement, so declaring it there
 * is all a new inline interaction has to do.
 *
 * @param {string} tagName - The interaction's XML tag name, lower-cased
 * @returns {boolean}
 */
export function isInlineInteraction(tagName) {
  return registry[tagName]?.placement === Placement.INLINE;
}
