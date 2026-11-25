/**
 * Question types for feedback forms, shared by the form builder and the responses view.
 *
 *   Rating       1 to 5 numbers (1 = Poor, 5 = Excellent)
 *   Stars        1 to 5 stars, for overall quality of a session, module or speaker
 *   Emoji        five faces, a quick feeling with little effort
 *   Agree scale  Likert: Strongly disagree to Strongly agree, for statements ("I can apply this to my work")
 *   0–10 scale   "How likely are you to recommend…", summarised as a Net Promoter Score
 *   Thumbs       thumbs up or down plus quick tags (Clear, Too fast…) so people say why without typing
 *   Choice       one of a few options
 *   Open text    a written answer
 *
 * Answers: the five-point types store 1–5, the 0–10 scale stores 0–10, Thumbs stores { up, tags }.
 */
export const Q_TYPES = [
  { id: 'Rating', label: 'Rating 1–5' },
  { id: 'Stars', label: 'Star rating' },
  { id: 'Emoji', label: 'Emoji scale' },
  { id: 'Agree scale', label: 'Agree scale' },
  { id: '0–10 scale', label: '0–10 scale' },
  { id: 'Thumbs', label: 'Thumbs + tags' },
  { id: 'Choice', label: 'Choice' },
  { id: 'Open text', label: 'Open text' },
];
export const typeLabel = (t) => Q_TYPES.find((x) => x.id === t)?.label ?? t;

export const FIVE_POINT = ['Rating', 'Stars', 'Emoji', 'Agree scale'];
export const isFivePoint = (t) => FIVE_POINT.includes(t);

export const EMOJI = ['😫', '🙁', '😐', '🙂', '🤩'];          // 1 … 5
export const EMOJI_WORDS = ['Very unhappy', 'Unhappy', 'Okay', 'Happy', 'Very happy'];
export const AGREE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export const DEFAULT_TAGS = ['Clear', 'Engaging', 'Practical', 'Too fast', 'Too long'];

/** Options a question needs when it is switched to a type. */
export function optionsFor(type, current) {
  if (type === 'Choice') return current?.length ? current : ['Yes', 'No'];
  if (type === 'Thumbs') return current?.length ? current : [...DEFAULT_TAGS];
  return current;
}

/** Net Promoter Score from 0–10 answers: % of 9–10 minus % of 0–6. */
export function npsOf(values) {
  if (!values.length) return null;
  const pro = values.filter((v) => v >= 9).length;
  const det = values.filter((v) => v <= 6).length;
  return Math.round(((pro - det) / values.length) * 100);
}
