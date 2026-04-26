import sanitizeHtml from "sanitize-html";

const BLOCK_END_TAG_PATTERN = /<\/(address|article|aside|blockquote|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|li|main|nav|ol|p|pre|section|table|tr|ul)>/gi;
const LINE_BREAK_PATTERN = /<br\s*\/?>/gi;
const LIST_ITEM_START_PATTERN = /<li\b[^>]*>/gi;

export const htmlToPlainText = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.includes("<")) {
    return trimmed;
  }

  const prepared = trimmed
    .replace(LINE_BREAK_PATTERN, "\n")
    .replace(LIST_ITEM_START_PATTERN, "- ")
    .replace(BLOCK_END_TAG_PATTERN, "\n");

  const plainText = sanitizeHtml(prepared, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const normalized = plainText
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

  return normalized || null;
};
