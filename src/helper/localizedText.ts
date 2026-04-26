import type { ResponseLocale } from "../model";

const normalizeLocalizedInput = (
  value: string | null | undefined,
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const pickLocalizedString = (
  locale: ResponseLocale,
  idValue: string | null | undefined,
  enValue: string | null | undefined,
): string | null => {
  const normalizedId = normalizeLocalizedInput(idValue);
  const normalizedEn = normalizeLocalizedInput(enValue);

  if (locale === "en") {
    return normalizedEn ?? normalizedId;
  }

  return normalizedId ?? normalizedEn;
};

export const pickLocalizedValue = (
  locale: ResponseLocale,
  value: { id: string | null; en: string | null },
): string | null => pickLocalizedString(locale, value.id, value.en);

export const pickEnglishFirstString = (
  idValue: string | null | undefined,
  enValue: string | null | undefined,
): string | null => pickLocalizedString("en", idValue, enValue);

export const pickEnglishFirstValue = (
  value: { id: string | null; en: string | null },
): string | null => pickEnglishFirstString(value.id, value.en);
