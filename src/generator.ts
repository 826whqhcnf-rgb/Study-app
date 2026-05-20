/**
 * Heuristic, client-side "AI" flashcard generator.
 *
 * Supports two complementary strategies for turning pasted notes into
 * question/answer pairs without needing an external API:
 *
 *  1) Explicit pair detection
 *     - Lines containing a separator such as "—", " - ", ": ", " = ", " :: ", " => "
 *       become Front/Back pairs (front before separator, back after).
 *     - Q:/A: line pairs are recognised.
 *
 *  2) Sentence -> cloze + comprehension question
 *     - Long sentences are split, key terms (capitalised nouns, longest
 *       informative words, numbers, dates) are identified.
 *     - For each sentence we generate either a "What is X?" style question or
 *       a fill-in-the-blank cloze.
 */

export interface GeneratedCard {
  front: string;
  back: string;
}

const SEPARATORS = [
  ' :: ',
  ' — ',
  ' – ',
  ' => ',
  ' = ',
  ' - ',
  ': ',
];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for',
  'from', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'this', 'that', 'these', 'those', 'it', 'its', 'their', 'they', 'them',
  'which', 'who', 'whom', 'whose', 'what', 'when', 'where', 'why', 'how',
  'into', 'than', 'then', 'so', 'such', 'also', 'because', 'while', 'between',
  'about', 'over', 'under', 'after', 'before', 'during', 'each', 'all', 'any',
  'some', 'most', 'more', 'less', 'one', 'two', 'three', 'often', 'usually',
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function pickKeyTerm(sentence: string): string | null {
  // Prefer capitalised multi-word phrases (proper nouns).
  const proper = sentence.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g);
  if (proper && proper.length) {
    proper.sort((a, b) => b.length - a.length);
    const top = proper.find((p) => p.split(' ').length > 1) || proper[0];
    if (top && !/^(The|A|An|This|That|These|Those|It|If|When)$/.test(top)) return top;
  }
  // Otherwise pick the longest non-stopword token longer than 4 chars.
  const tokens = sentence
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w.toLowerCase()));
  if (tokens.length === 0) return null;
  tokens.sort((a, b) => b.length - a.length);
  return tokens[0];
}

function explicitPairs(text: string): GeneratedCard[] {
  const out: GeneratedCard[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Q:/A: pairs
  for (let i = 0; i < lines.length - 1; i++) {
    const q = lines[i].match(/^Q[:.\)]\s*(.+)$/i);
    const a = lines[i + 1].match(/^A[:.\)]\s*(.+)$/i);
    if (q && a) {
      out.push({ front: q[1].trim(), back: a[1].trim() });
      i++; // skip next
    }
  }

  // Single-line "Front SEP Back" entries
  for (const line of lines) {
    if (/^Q[:.\)]/i.test(line) || /^A[:.\)]/i.test(line)) continue;
    for (const sep of SEPARATORS) {
      const idx = line.indexOf(sep);
      if (idx > 0 && idx < line.length - sep.length) {
        const front = line.slice(0, idx).trim().replace(/^[-*•]\s*/, '');
        const back = line.slice(idx + sep.length).trim();
        if (front.length >= 1 && back.length >= 1 && front.length < 220) {
          out.push({ front, back });
        }
        break;
      }
    }
  }
  return out;
}

function fromSentences(text: string, max: number): GeneratedCard[] {
  const out: GeneratedCard[] = [];
  const sentences = splitSentences(text).filter((s) => s.length > 30 && s.length < 320);
  for (const sentence of sentences) {
    if (out.length >= max) break;
    const term = pickKeyTerm(sentence);
    if (!term) continue;

    // Toggle between cloze and question style for variety.
    if (out.length % 2 === 0) {
      const cloze = sentence.replace(new RegExp(`\\b${escapeRegex(term)}\\b`), '_____');
      if (cloze === sentence) continue;
      out.push({ front: `Fill in the blank: ${cloze}`, back: term });
    } else {
      out.push({ front: `In the following, what concept is being described?\n\n"${sentence}"`, back: term });
    }
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dedupe(cards: GeneratedCard[]): GeneratedCard[] {
  const seen = new Set<string>();
  const out: GeneratedCard[] = [];
  for (const c of cards) {
    const key = (c.front + '||' + c.back).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

export function generateCards(text: string, maxFromSentences = 12): GeneratedCard[] {
  const explicit = explicitPairs(text);
  const sentencesNeeded = Math.max(0, maxFromSentences - explicit.length);
  const generated = sentencesNeeded > 0 ? fromSentences(text, sentencesNeeded) : [];
  return dedupe([...explicit, ...generated]).slice(0, 40);
}
