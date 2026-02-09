import sanitizeHtml from "sanitize-html";

export const sanitizeWysiwygHtml = (dirty: string): string => {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p",
      "br",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    disallowedTagsMode: "discard",
  });
};
