import type { EducationSuccessMessageKey, ResponseLocale } from "../model";

const EDUCATION_SUCCESS_MESSAGES: Record<
  EducationSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  EDUCATION_CREATED_SUCCESS: {
    id: "Education berhasil dibuat",
    en: "Education created successfully",
  },
  EDUCATION_UPDATED_SUCCESS: {
    id: "Education berhasil diperbarui",
    en: "Education updated successfully",
  },
  EDUCATION_DELETED_SUCCESS: {
    id: "Education berhasil dihapus",
    en: "Education deleted successfully",
  },
  EDUCATION_SORT_UPDATED_SUCCESS: {
    id: "Urutan education berhasil diperbarui",
    en: "Education sort order updated successfully",
  },
};

export const getEducationSuccessMessage = (
  locale: ResponseLocale,
  key: EducationSuccessMessageKey,
): string => {
  return EDUCATION_SUCCESS_MESSAGES[key][locale];
};
