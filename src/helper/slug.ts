const MAX_SLUG_LENGTH = 160;

const trimSlugToLength = (slug: string, maxLength: number): string =>
  slug.slice(0, maxLength).replace(/-+$/g, "");

export const createSlugFromTitle = (title: string): string => {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return trimSlugToLength(slug || "portfolio", MAX_SLUG_LENGTH) || "portfolio";
};

export const createSlugCandidate = (baseSlug: string, sequence: number): string => {
  if (sequence <= 1) {
    return baseSlug;
  }

  const suffix = `-${sequence}`;
  const trimmedBase = trimSlugToLength(baseSlug, MAX_SLUG_LENGTH - suffix.length);

  return `${trimmedBase || "portfolio"}${suffix}`;
};
