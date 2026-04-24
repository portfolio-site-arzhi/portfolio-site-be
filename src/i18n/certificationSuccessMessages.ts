import type { CertificationSuccessMessageKey, ResponseLocale } from "../model";

const CERTIFICATION_SUCCESS_MESSAGES: Record<
  CertificationSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  CERTIFICATION_CREATED_SUCCESS: {
    id: "Certification berhasil dibuat",
    en: "Certification created successfully",
  },
  CERTIFICATION_UPDATED_SUCCESS: {
    id: "Certification berhasil diperbarui",
    en: "Certification updated successfully",
  },
  CERTIFICATION_DELETED_SUCCESS: {
    id: "Certification berhasil dihapus",
    en: "Certification deleted successfully",
  },
  CERTIFICATION_SORT_UPDATED_SUCCESS: {
    id: "Urutan certification berhasil diperbarui",
    en: "Certification sort order updated successfully",
  },
};

export const getCertificationSuccessMessage = (
  locale: ResponseLocale,
  key: CertificationSuccessMessageKey,
): string => {
  return CERTIFICATION_SUCCESS_MESSAGES[key][locale];
};
