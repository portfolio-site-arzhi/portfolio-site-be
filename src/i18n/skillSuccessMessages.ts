import type { ResponseLocale, SkillSuccessMessageKey } from "../model";

const SKILL_SUCCESS_MESSAGES: Record<
  SkillSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  SKILL_CREATED_SUCCESS: {
    id: "Skill berhasil dibuat",
    en: "Skill created successfully",
  },
  SKILL_UPDATED_SUCCESS: {
    id: "Skill berhasil diperbarui",
    en: "Skill updated successfully",
  },
  SKILL_DELETED_SUCCESS: {
    id: "Skill berhasil dihapus",
    en: "Skill deleted successfully",
  },
  SKILL_SORT_UPDATED_SUCCESS: {
    id: "Urutan skill berhasil diperbarui",
    en: "Skill sort order updated successfully",
  },
  SKILL_IMPORTED_SUCCESS: {
    id: "Skill berhasil diimport",
    en: "Skill imported successfully",
  },
};

export const getSkillSuccessMessage = (
  locale: ResponseLocale,
  key: SkillSuccessMessageKey,
): string => {
  return SKILL_SUCCESS_MESSAGES[key][locale];
};
