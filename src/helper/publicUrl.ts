export const withBaseUrl = (value: string | null): string | null => {
  if (!value) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const baseUrl = process.env.BASEURL;
  if (!baseUrl) {
    return value;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  if (value.startsWith("/")) {
    return `${normalizedBaseUrl}${value}`;
  }

  return `${normalizedBaseUrl}/${value}`;
};
