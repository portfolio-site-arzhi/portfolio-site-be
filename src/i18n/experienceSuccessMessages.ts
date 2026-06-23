import type { ExperienceSuccessMessageKey, ResponseLocale } from "../model";

const EXPERIENCE_SUCCESS_MESSAGES: Record<
  ExperienceSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  EXPERIENCE_CREATED_SUCCESS: {
    id: "Experience berhasil dibuat",
    en: "Experience created successfully",
  },
  EXPERIENCE_UPDATED_SUCCESS: {
    id: "Experience berhasil diperbarui",
    en: "Experience updated successfully",
  },
  EXPERIENCE_DELETED_SUCCESS: {
    id: "Experience berhasil dihapus",
    en: "Experience deleted successfully",
  },
  EXPERIENCE_SORT_UPDATED_SUCCESS: {
    id: "Urutan experience berhasil diperbarui",
    en: "Experience sort order updated successfully",
  },
  EXPERIENCE_IMPORTED_SUCCESS: {
    id: "Experience berhasil diimport",
    en: "Experience imported successfully",
  },
};

export const getExperienceSuccessMessage = (
  locale: ResponseLocale,
  key: ExperienceSuccessMessageKey,
): string => {
  return EXPERIENCE_SUCCESS_MESSAGES[key][locale];
};
