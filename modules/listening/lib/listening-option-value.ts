/** Unique MCQ selection when option labels collide (e.g. three “21”s). */

const OPTION_VALUE_SEP = "::";

/** Radio/checkbox value that stays unique even when labels duplicate. */
export function listeningOptionValue(index: number, label: string): string {
  return `${index}${OPTION_VALUE_SEP}${label}`;
}

/** Label (or raw answer) stored for scoring / API submit. */
export function listeningOptionLabelFromValue(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const sep = raw.indexOf(OPTION_VALUE_SEP);
  if (sep <= 0) return raw;
  const idxPart = raw.slice(0, sep);
  if (!/^\d+$/.test(idxPart)) return raw;
  return raw.slice(sep + OPTION_VALUE_SEP.length);
}

/** True when every option has a distinct single-letter label (A–Z). */
export function listeningOptionsHaveUniqueLetters(
  options: Array<{ label: string }>,
): boolean {
  if (!options.length) return false;
  const letters = options.map((o) => o.label.trim().toUpperCase());
  if (!letters.every((l) => /^[A-Z]$/.test(l))) return false;
  return new Set(letters).size === letters.length;
}

export function listeningOptionLetter(index: number): string {
  if (index < 0) return "?";
  if (index < 26) return String.fromCharCode(65 + index);
  return String(index + 1);
}
