import type { ResponseLocale } from "../model";

export const pickLocalizedString = (
  locale: ResponseLocale,
  idValue: string | null | undefined,
  enValue: string | null | undefined,
): string | null => {
  if (locale === "en") {
    return enValue ?? idValue ?? null;
  }

  return idValue ?? enValue ?? null;
};

export const pickLocalizedValue = (
  locale: ResponseLocale,
  value: { id: string | null; en: string | null },
): string | null => pickLocalizedString(locale, value.id, value.en);
