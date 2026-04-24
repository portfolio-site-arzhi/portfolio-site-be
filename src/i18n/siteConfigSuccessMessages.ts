import type { ResponseLocale, SiteConfigSuccessMessageKey } from "../model";

const SITE_CONFIG_SUCCESS_MESSAGES: Record<
  SiteConfigSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  SITE_CONFIG_BULK_UPDATED_SUCCESS: {
    id: "Konfigurasi situs berhasil diperbarui",
    en: "Site configuration updated successfully",
  },
};

export const getSiteConfigSuccessMessage = (
  locale: ResponseLocale,
  key: SiteConfigSuccessMessageKey,
): string => {
  return SITE_CONFIG_SUCCESS_MESSAGES[key][locale];
};
