import Negotiator from "negotiator";
import type { ResponseLocale } from "../model";

const SUPPORTED_RESPONSE_LOCALES: ResponseLocale[] = ["id", "en"];

export const resolveResponseLocale = (
  acceptLanguageHeader?: string | string[],
): ResponseLocale => {
  const headerValue = Array.isArray(acceptLanguageHeader)
    ? acceptLanguageHeader.join(",")
    : acceptLanguageHeader;

  if (typeof headerValue !== "string" || headerValue.trim() === "") {
    return "id";
  }

  const negotiator = new Negotiator({
    headers: {
      "accept-language": headerValue,
    },
  });

  const matchedLocale = negotiator.language(SUPPORTED_RESPONSE_LOCALES);

  return matchedLocale === "en" ? "en" : "id";
};
