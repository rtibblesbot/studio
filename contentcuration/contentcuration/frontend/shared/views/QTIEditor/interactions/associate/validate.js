import flatten from 'lodash/flatten';
import { ValidationError } from '../../constants';
import { stripTags } from '../../utils/stripTags';

/**
 * The comparable text of a choice: two choices hold the same answer when this
 * matches, whatever markup either of them carries.
 *
 * @param {string} content
 * @returns {string}
 */
export const choiceText = content => stripTags(content).trim();

/**
 * Validate AssociateState → ValidationError[].
 *
 * Choice-scoped errors carry `id`; pair-scoped errors carry the pair's `index`,
 * because both members of a broken pair may be blank or share an id;
 * duplication errors carry the repeated `text`, because an id may be repeated
 * across choices and so cannot single one out.
 *
 * @param {object} state - AssociateState
 * @returns {Array<{ code: string, id?: string, index?: number, text?: string }>}
 */
export function validateAssociateInteraction(state) {
  const errors = [];
  const { prompt, pairs = [], distractors = [] } = state;

  if (!choiceText(prompt)) {
    errors.push({ code: ValidationError.PROMPT_REQUIRED });
  }

  const allChoices = [...flatten(pairs), ...distractors];

  for (const { id, content } of allChoices) {
    if (!choiceText(content)) {
      errors.push({ code: ValidationError.EMPTY_CHOICE_CONTENT, id });
    }
  }

  let validPairs = 0;
  pairs.forEach(([first, second], index) => {
    const [firstText, secondText] = [choiceText(first.content), choiceText(second.content)];
    if (!firstText || !secondText) {
      return;
    }
    if (firstText === secondText) {
      errors.push({ code: ValidationError.DUPLICATE_PAIR_CONTENT, index });
    } else {
      validPairs += 1;
    }
  });

  if (validPairs < 1) {
    errors.push({ code: ValidationError.TOO_FEW_PAIRS });
  }

  // A distractor is there to be the wrong answer, so repeating another
  // distractor or an item the author already paired makes it unanswerable.
  // Content reused across two pairs stays valid — only distractors are flagged.
  const occurrences = new Map();
  for (const { content } of allChoices) {
    const text = choiceText(content);
    if (text) {
      occurrences.set(text, (occurrences.get(text) || 0) + 1);
    }
  }

  const repeated = new Set(
    distractors.map(({ content }) => choiceText(content)).filter(text => occurrences.get(text) > 1),
  );
  for (const text of repeated) {
    errors.push({ code: ValidationError.DUPLICATE_DISTRACTOR_CONTENT, text });
  }

  return errors;
}
