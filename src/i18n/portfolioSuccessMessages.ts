import type { PortfolioSuccessMessageKey, ResponseLocale } from "../model";

const PORTFOLIO_SUCCESS_MESSAGES: Record<
  PortfolioSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  PORTFOLIO_CREATED_SUCCESS: {
    id: "Portfolio berhasil dibuat",
    en: "Portfolio created successfully",
  },
  PORTFOLIO_UPDATED_SUCCESS: {
    id: "Portfolio berhasil diperbarui",
    en: "Portfolio updated successfully",
  },
  PORTFOLIO_DELETED_SUCCESS: {
    id: "Portfolio berhasil dihapus",
    en: "Portfolio deleted successfully",
  },
  PORTFOLIO_SORT_UPDATED_SUCCESS: {
    id: "Urutan portfolio berhasil diperbarui",
    en: "Portfolio sort order updated successfully",
  },
};

export const getPortfolioSuccessMessage = (
  locale: ResponseLocale,
  key: PortfolioSuccessMessageKey,
): string => {
  return PORTFOLIO_SUCCESS_MESSAGES[key][locale];
};
