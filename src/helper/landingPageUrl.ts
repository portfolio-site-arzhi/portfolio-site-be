export const getLandingPageUrl = (): string | null => {
  const value = process.env.LANDING_PAGE_URL?.trim();

  return value ? value : null;
};
